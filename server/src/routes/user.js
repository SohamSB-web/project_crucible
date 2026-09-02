/**
 * server/routes/user.js
 * Server-side API endpoints connecting directly to the Neon PostgreSQL database via Prisma.
 */

import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = Router();

// ─── Hackathon Settings ───────────────────────────────────────────────────────

// Get hackathon settings
router.get('/settings', async (req, res) => {
    try {
        let settings = await prisma.hackathonSetting.findUnique({ where: { id: 1 } });
        if (!settings) {
            settings = await prisma.hackathonSetting.create({
                data: {
                    id: 1,
                    name: 'CRUCIBLE Hackathon 2026',
                    year: 2026,
                    deadline: '2026-08-30',
                    hackathonStatus: 'Live',
                    registrationStatus: 'Open',
                },
            });
        }
        res.json({ success: true, data: settings });
    } catch (error) {
        console.error('Error fetching hackathon settings:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// Save / Update hackathon settings
router.put('/settings', async (req, res) => {
    try {
        const { name, year, deadline, hackathonStatus, registrationStatus } = req.body;
        const settings = await prisma.hackathonSetting.upsert({
            where: { id: 1 },
            update: {
                ...(name && { name }),
                ...(year && { year: Number(year) }),
                ...(deadline && { deadline }),
                ...(hackathonStatus && { hackathonStatus }),
                ...(registrationStatus && { registrationStatus }),
            },
            create: {
                id: 1,
                name: name || 'CRUCIBLE Hackathon 2026',
                year: year ? Number(year) : 2026,
                deadline: deadline || '2026-08-30',
                hackathonStatus: hackathonStatus || 'Live',
                registrationStatus: registrationStatus || 'Open',
            },
        });
        res.json({ success: true, data: settings });
    } catch (error) {
        console.error('Error saving hackathon settings:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// ─── Problem Statements (Tracks) ───────────────────────────────────────────────

// Get all problem statements
router.get('/problems', async (req, res) => {
    try {
        const tracks = await prisma.track.findMany({
            orderBy: { id: 'asc' },
        });
        res.json({ success: true, data: tracks });
    } catch (error) {
        console.error('Error fetching problem statements:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});



// ─── User Submissions ──────────────────────────────────────────────────────────

// Get user submission by team ID
router.get('/submissions/:teamId', async (req, res) => {
    try {
        const { teamId } = req.params;
        const submission = await prisma.submission.findUnique({
            where: { team_id: teamId },
            include: { team: true },
        });

        if (!submission) {
            return res.status(404).json({ success: false, error: 'Submission not found' });
        }

        res.json({
            success: true,
            data: {
                fileName: submission.original_name,
                fileSize: (submission.size_bytes / (1024 * 1024)).toFixed(2) + ' MB',
                date: submission.submitted_at.toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
                status: submission.locked ? 'Locked' : 'Submitted',
                filePath: submission.file_path,
            },
        });
    } catch (error) {
        console.error('Error fetching user submission:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// ─── Notifications ─────────────────────────────────────────────────────────────

// Get notifications
router.get('/notifications', async (req, res) => {
    try {
        let notifications = await prisma.notification.findMany({
            orderBy: { created_at: 'desc' },
        });

        if (notifications.length === 0) {
            // Seed default notifications if table is empty
            const defaults = [
                { title: 'Problem Statements Released', time: '2 hours ago', unread: true, detail: 'All official problem statements are now active.' },
                { title: 'Final Presentation Deadline', time: '1 day ago', unread: true, detail: 'Ensure your PPT or PDF presentation is uploaded before deadline.' },
            ];
            for (const item of defaults) {
                await prisma.notification.create({ data: item });
            }
            notifications = await prisma.notification.findMany({ orderBy: { created_at: 'desc' } });
        }

        res.json({ success: true, data: notifications });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// Mark all notifications as read
router.patch('/notifications/read', async (req, res) => {
    try {
        await prisma.notification.updateMany({
            data: { unread: false },
        });
        const notifications = await prisma.notification.findMany({ orderBy: { created_at: 'desc' } });
        res.json({ success: true, data: notifications });
    } catch (error) {
        console.error('Error marking notifications read:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

export default router;