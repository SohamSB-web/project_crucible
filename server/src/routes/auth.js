const { Router } = require('express');
const { z } = require('zod');
const bcrypt = require('bcryptjs');
const prisma = require('../lib/prisma');
const { signTeamToken, signJudgeToken } = require('../middleware/auth');
const { loginLimiter } = require('../middleware/ratelimit');

const router = Router();

// ─── Validation schemas ───────────────────────────────────────────────────────

const teamLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const adminLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// ─── POST /api/auth/team/login ─────────────────────────────────────────────────

router.post('/team/login', loginLimiter, async (req, res) => {
  const parsed = teamLoginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, error: 'Invalid email or password format.' });
  }

  const { email, password } = parsed.data;

  try {
    // Find team by lead email
    const team = await prisma.team.findUnique({
      where: { lead_email: email.toLowerCase() },
      include: { members: true, credential: true },
    });

    if (!team || !team.credential) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }

    const valid = await bcrypt.compare(password, team.credential.password_hash);
    if (!valid) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }

    const token = signTeamToken(team);
    const lead = team.members.find((m) => m.role === 'lead');

    return res.json({
      success: true,
      data: {
        token,
        role: 'user', // maps to frontend role
        user: {
          id: team.id,
          name: lead?.name || team.lead_email,
          email: team.lead_email,
          role: 'user',
          teamId: team.id,
        },
      },
    });
  } catch (err) {
    console.error('[Auth/TeamLogin]', err);
    return res.status(500).json({ success: false, error: 'Login failed. Please try again.' });
  }
});

// ─── POST /api/auth/admin/login ────────────────────────────────────────────────

router.post('/admin/login', loginLimiter, async (req, res) => {
  const parsed = adminLoginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, error: 'Invalid email or password format.' });
  }

  const { email, password } = parsed.data;

  try {
    const judgeUser = await prisma.judgeUser.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!judgeUser) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }

    const valid = await bcrypt.compare(password, judgeUser.password_hash);
    if (!valid) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }

    const token = signJudgeToken(judgeUser);

    return res.json({
      success: true,
      data: {
        token,
        role: judgeUser.role, // 'admin' or 'judge'
        user: {
          id: judgeUser.id,
          name: judgeUser.name,
          email: judgeUser.email,
          role: judgeUser.role,
        },
      },
    });
  } catch (err) {
    console.error('[Auth/AdminLogin]', err);
    return res.status(500).json({ success: false, error: 'Login failed. Please try again.' });
  }
});

module.exports = router;
