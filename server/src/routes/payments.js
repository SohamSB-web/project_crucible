const { Router } = require('express');
const prisma = require('../lib/prisma');
const { uploadPaymentScreenshot } = require('../lib/paymentStorage');
const { requireAuth, requireRole } = require('../middleware/auth');
const { uploadPayment, validatePaymentMimeType } = require('../middleware/upload');

const router = Router();

router.post(
    '/upload-screenshot',
    requireAuth,
    requireRole('team'),
    (req, res, next) => {
        console.log('[Payment Route] Hit /upload-screenshot endpoint');
        next();
    },
    (req, res, next) => {
        uploadPayment.single('file')(req, res, function (err) {
            if (err) {
                console.error('[Multer Error Caught]:', err);
                return res.status(400).json({ success: false, error: err.message || 'File upload error' });
            }
            next();
        });
    },
    validatePaymentMimeType,
    async (req, res) => {
        try {
            console.log('[Payment Route] Multer processing & MIME validation complete.');
            console.log('[Payment Route] req.file:', req.file ? { originalname: req.file.originalname, size: req.file.size, mimetype: req.file.mimetype, detectedMime: req.file.detectedMime } : 'undefined');
            console.log('[Payment Route] req.user:', req.user);

            const teamId = req.user?.teamId || req.user?.id;
            const file = req.file;

            if (!file) {
                console.warn('[Payment Route] Validation failed: No file provided.');
                return res.status(400).json({ success: false, error: 'No screenshot uploaded.' });
            }

            if (!teamId) {
                console.warn('[Payment Route] Validation failed: Missing teamId on req.user.');
                return res.status(400).json({ success: false, error: 'User team ID not found.' });
            }

            const ext = file.originalname.slice(file.originalname.lastIndexOf('.')).toLowerCase();
            const storagePath = `${teamId}/payment-receipt${ext}`;
            console.log(`[Payment Route] Attempting Supabase upload to path: ${storagePath}`);

            // 1. Upload to Supabase
            const uploadResult = await uploadPaymentScreenshot(storagePath, file.buffer, file.mimetype);
            console.log('[Payment Route] Supabase upload successful:', uploadResult);

            // 2. Update Database via Prisma
            console.log('[Payment Route] Attempting database upsert for teamId:', teamId);
            const paymentRecord = await prisma.payment.upsert({
                where: { team_id: teamId },
                create: {
                    team_id: teamId,
                    file_path: storagePath,
                    original_name: file.originalname,
                    status: 'Pending',
                },
                update: {
                    file_path: storagePath,
                    original_name: file.originalname,
                    status: 'Pending',
                    uploaded_at: new Date(),
                },
            });
            console.log('[Payment Route] Database upsert successful:', paymentRecord);

            return res.status(200).json({
                success: true,
                data: {
                    fileName: paymentRecord.original_name,
                    status: paymentRecord.status,
                    uploadedAt: paymentRecord.uploaded_at,
                },
            });
        } catch (err) {
            console.error('[Payment Route CATCH ERROR CRASH PREVENTED]:', err);
            if (!res.headersSent) {
                return res.status(500).json({
                    success: false,
                    error: err.message || 'Internal server error during payment processing.'
                });
            }
        }
    }
);

module.exports = router;