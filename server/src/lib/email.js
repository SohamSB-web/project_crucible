/**
 * email.js — Dual-mode mailer
 *
 * Priority: SMTP (Nodemailer) → Resend → console-log fallback
 *
 * For local dev:    Set SMTP_USER + SMTP_PASS (Gmail App Password works great)
 * For production:   Use Resend (RESEND_API_KEY) with a custom domain
 *
 * Gmail setup:
 *   1. Enable 2FA on your Google account
 *   2. Go to https://myaccount.google.com/apppasswords
 *   3. Generate an App Password for "Mail"
 *   4. Set SMTP_USER=yourmail@gmail.com, SMTP_PASS=the-16-char-app-password
 */

const nodemailer = require('nodemailer');
const { Resend } = require('resend');

// ─── SMTP Transport (Nodemailer) ──────────────────────────────────────────────

let _smtpTransport;
function getSmtpTransport() {
  if (_smtpTransport) return _smtpTransport;

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null;

  const port = Number(SMTP_PORT) || 587;
  // Port 465 uses direct SSL (secure: true). Port 587 uses STARTTLS (secure: false).
  const isSecure = SMTP_SECURE !== undefined ? (SMTP_SECURE === 'true' || SMTP_SECURE === true) : port === 465;

  _smtpTransport = nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: isSecure,
    auth: { user: SMTP_USER, pass: SMTP_PASS.replace(/\s+/g, '') },
    connectionTimeout: 8000, // 8s timeout to avoid hanging if host blocks SMTP ports
    greetingTimeout: 8000,
    socketTimeout: 10000,
    tls: { rejectUnauthorized: false },
  });

  return _smtpTransport;
}

// ─── Resend Transport ─────────────────────────────────────────────────────────

let _resend;
function getResend() {
  if (_resend) return _resend;
  if (!process.env.RESEND_API_KEY) return null;
  _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}

// ─── FROM address resolution ──────────────────────────────────────────────────

function getFromAddress() {
  const isGmail = (process.env.SMTP_HOST || '').includes('gmail.com') || (process.env.SMTP_USER || '').endsWith('@gmail.com');
  // Gmail rejects emails if the From address doesn't match the authenticated user
  if (isGmail && process.env.SMTP_USER) {
    const rawFrom = process.env.EMAIL_FROM || 'Mission Crucible';
    const match = rawFrom.match(/^([^<]+)/);
    const displayName = match ? match[1].trim() : 'Mission Crucible';
    return `"${displayName}" <${process.env.SMTP_USER}>`;
  }
  return process.env.EMAIL_FROM || 'Mission Crucible <noreply@example.com>';
}

// ─── Unified send function ─────────────────────────────────────────────────────

async function sendMail({ to, subject, html }) {
  const configuredTransport = String(process.env.EMAIL_TRANSPORT || '').toLowerCase();
  const from = getFromAddress();

  // 1. If explicitly set to resend, use Resend API (HTTP port 443 — works everywhere including Render Free Tier)
  if (configuredTransport === 'resend') {
    const resend = getResend();
    if (resend) {
      try {
        const resendFrom = process.env.EMAIL_FROM || 'Mission Crucible <onboarding@resend.dev>';
        await resend.emails.send({ from: resendFrom, to: [to], subject, html });
        console.log('[Email/Resend] Sent to:', to, '| Subject:', subject);
        return;
      } catch (resendErr) {
        console.error('[Email/Resend] Failed:', resendErr.message);
        throw new Error(`Resend send failed: ${resendErr.message}`);
      }
    } else {
      throw new Error('EMAIL_TRANSPORT is set to resend but RESEND_API_KEY is missing.');
    }
  }

  // 2. Try SMTP (Nodemailer)
  const smtp = getSmtpTransport();
  if (smtp) {
    try {
      await smtp.sendMail({ from, to, subject, html });
      console.log('[Email/SMTP] Sent to:', to, '| Subject:', subject);
      return;
    } catch (smtpErr) {
      console.warn('[Email/SMTP] Failed (' + smtpErr.message + ')');

      // Attempt Resend fallback if API key is provided
      const resend = getResend();
      if (resend) {
        try {
          console.log('[Email] Falling back to Resend API...');
          const resendFrom = process.env.EMAIL_FROM || 'Mission Crucible <onboarding@resend.dev>';
          await resend.emails.send({ from: resendFrom, to: [to], subject, html });
          console.log('[Email/Resend fallback] Sent to:', to, '| Subject:', subject);
          return;
        } catch (resendErr) {
          console.warn('[Email/Resend fallback] Failed (' + resendErr.message + ')');
        }
      }

      if (configuredTransport === 'smtp') {
        throw new Error(`SMTP send failed: ${smtpErr.message}`);
      }
    }
  }

  if (configuredTransport === 'smtp') {
    throw new Error('SMTP is selected but SMTP_HOST, SMTP_USER, or SMTP_PASS is missing.');
  }

  // 3. Fallback: log to console
  console.warn('[Email] Fallback — logged to console.');
  console.log('[Email/console] To:', to, '| Subject:', subject);
}

// ─── Email Templates ──────────────────────────────────────────────────────────

/**
 * Send credential delivery email to the Team Lead after registration.
 */
async function sendCredentialEmail({ to, teamName, teamId, joinCode, tempPassword }) {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>You're registered — Mission Crucible 2026</title>
  <style>
    body { margin: 0; padding: 0; background: #0a0e17; font-family: 'Segoe UI', Arial, sans-serif; color: #e8eeff; }
    .container { max-width: 560px; margin: 40px auto; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #0a0e17 0%, #142034 100%); padding: 40px 40px 32px; border-bottom: 1px solid rgba(45,91,255,0.3); }
    .logo { font-size: 11px; letter-spacing: 3px; color: #71a7ff; font-weight: 600; margin-bottom: 12px; }
    .title { font-size: 28px; font-weight: 700; color: #e8eeff; margin: 0; line-height: 1.2; }
    .body { padding: 36px 40px; }
    .greeting { font-size: 16px; color: #a0b4d0; margin-bottom: 24px; }
    .card { background: rgba(45,91,255,0.08); border: 1px solid rgba(45,91,255,0.25); border-radius: 12px; padding: 24px; margin-bottom: 24px; }
    .row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.05); }
    .row:last-child { border-bottom: none; }
    .label { font-size: 12px; letter-spacing: 1px; color: #71a7ff; font-weight: 600; }
    .value { font-size: 16px; font-weight: 700; color: #e8eeff; font-family: 'Courier New', monospace; letter-spacing: 2px; }
    .warning { background: rgba(255,160,0,0.08); border: 1px solid rgba(255,160,0,0.25); border-radius: 10px; padding: 16px 20px; margin-bottom: 24px; font-size: 13px; color: #ffa000; }
    .footer { padding: 24px 40px; border-top: 1px solid rgba(255,255,255,0.06); font-size: 12px; color: #506080; text-align: center; }
    .cta { display: inline-block; background: #2d5bff; color: #fff; text-decoration: none; font-weight: 600; font-size: 14px; padding: 12px 28px; border-radius: 8px; margin: 4px 0 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">CSI · XAVIER INSTITUTE OF ENGINEERING</div>
      <h1 class="title">You're in. ✦</h1>
    </div>
    <div class="body">
      <p class="greeting">Hi there, <strong>${teamName}</strong> — your team is officially registered for <strong>Mission Crucible 2026</strong>. Share the join code below with your teammates so they can join your team.</p>

      <div class="card">
        <div class="row">
          <span class="label">TEAM NAME</span>
          <span class="value">${teamName}</span>
        </div>
        <div class="row">
          <span class="label">TEAM ID</span>
          <span class="value">${teamId}</span>
        </div>
        <div class="row">
          <span class="label">JOIN CODE</span>
          <span class="value">${joinCode}</span>
        </div>
        <div class="row">
          <span class="label">TEAM LOGIN EMAIL</span>
          <span class="value">${to}</span>
        </div>
        <div class="row">
          <span class="label">PASSWORD</span>
          <span class="value">${tempPassword}</span>
        </div>
      </div>

      <div class="warning">
        ⚠️ This is your team login password. Please change it after your first login. Do not share it — only share the <strong>Join Code</strong> with teammates.
      </div>

      <a class="cta" href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login">Login to your dashboard →</a>

      <p style="font-size:13px; color:#71a7ff; margin:0;">
        <strong>Round 1 Submission Window:</strong> Sept 22 – Sept 25, 2026<br/>
        Upload your PPT/PDF abstract from the dashboard before the deadline.
      </p>
    </div>
    <div class="footer">
      CSI Student Chapter · Xavier Institute of Engineering · Mission Crucible 2026<br/>
      You are receiving this because you registered for the hackathon.
    </div>
  </div>
</body>
</html>`;

  await sendMail({ to, subject: `✦ Mission Crucible 2026 — You're in! Team credentials inside`, html });
}

/**
 * Send a welcome email to a new team member who joined via join code.
 */
async function sendMemberWelcomeEmail({ to, memberName, teamName, joinCode }) {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <style>
    body { margin:0; padding:0; background:#0a0e17; font-family:'Segoe UI',Arial,sans-serif; color:#e8eeff; }
    .container { max-width:560px; margin:40px auto; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:16px; overflow:hidden; }
    .header { background:linear-gradient(135deg,#0a0e17 0%,#142034 100%); padding:40px 40px 32px; border-bottom:1px solid rgba(45,91,255,0.3); }
    .logo { font-size:11px; letter-spacing:3px; color:#71a7ff; font-weight:600; margin-bottom:12px; }
    .title { font-size:26px; font-weight:700; color:#e8eeff; margin:0; }
    .body { padding:36px 40px; }
    .card { background:rgba(45,91,255,0.08); border:1px solid rgba(45,91,255,0.25); border-radius:12px; padding:24px; margin-bottom:24px; }
    .row { display:flex; justify-content:space-between; align-items:center; padding:10px 0; border-bottom:1px solid rgba(255,255,255,0.05); }
    .row:last-child { border-bottom:none; }
    .label { font-size:12px; letter-spacing:1px; color:#71a7ff; font-weight:600; }
    .value { font-size:16px; font-weight:700; color:#e8eeff; font-family:'Courier New',monospace; }
    .footer { padding:24px 40px; border-top:1px solid rgba(255,255,255,0.06); font-size:12px; color:#506080; text-align:center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">CSI · XAVIER INSTITUTE OF ENGINEERING</div>
      <h1 class="title">Welcome to the team! ✦</h1>
    </div>
    <div class="body">
      <p>Hi <strong>${memberName}</strong> — you've successfully joined <strong>${teamName}</strong> at Mission Crucible 2026.</p>
      <div class="card">
        <div class="row">
          <span class="label">TEAM</span>
          <span class="value">${teamName}</span>
        </div>
        <div class="row">
          <span class="label">JOIN CODE</span>
          <span class="value">${joinCode}</span>
        </div>
      </div>
      <p style="font-size:13px;color:#a0b4d0;">
        Your team lead will handle the submission. Stay in touch with your team for updates on the hackathon schedule.
      </p>
    </div>
    <div class="footer">
      CSI Student Chapter · Xavier Institute of Engineering · Mission Crucible 2026
    </div>
  </div>
</body>
</html>`;

  await sendMail({ to, subject: `✦ You joined ${teamName} — Mission Crucible 2026`, html });
}

module.exports = { sendCredentialEmail, sendMemberWelcomeEmail };
