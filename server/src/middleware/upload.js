const multer = require('multer');

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_PAYMENT_SCREENSHOT_SIZE = 1 * 1024 * 1024; // 1 MB
const MAX_PARTICIPANT_IDS_SIZE = 1 * 1024 * 1024; // 1 MB

const ALLOWED_DOCUMENT_MIMES = new Set([
  'application/pdf',
  'application/vnd.ms-powerpoint',                                                   // .ppt
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',       // .pptx
]);

const ALLOWED_DOCUMENT_EXTENSIONS = new Set(['.pdf', '.ppt', '.pptx']);

const ALLOWED_PAYMENT_MIMES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp'
]);

const ALLOWED_PAYMENT_EXTENSIONS = new Set(['.pdf', '.jpg', '.jpeg', '.png', '.webp']);

// Store in memory so we can MIME-sniff before uploading to Supabase
const storage = multer.memoryStorage();

// 1. Upload middleware for standard documents (PPT, PPTX, PDF)
const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_req, file, cb) => {
    const ext = file.originalname.slice(file.originalname.lastIndexOf('.')).toLowerCase();
    if (!ALLOWED_DOCUMENT_EXTENSIONS.has(ext)) {
      return cb(new Error(`Invalid file type. Allowed: PDF, PPT, PPTX.`));
    }
    cb(null, true);
  },
});

// 2. Upload middleware specifically for payment screenshots (Images + PDF)
const uploadPayment = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_req, file, cb) => {
    const ext = file.originalname.slice(file.originalname.lastIndexOf('.')).toLowerCase();
    if (!ALLOWED_PAYMENT_EXTENSIONS.has(ext)) {
      return cb(new Error(`Invalid file type. Allowed: PDF, JPG, PNG, WEBP.`));
    }
    cb(null, true);
  },
});

const uploadPaymentScreenshot = multer({
  storage,
  limits: { fileSize: MAX_PAYMENT_SCREENSHOT_SIZE },
  fileFilter: (_req, file, cb) => {
    const ext = file.originalname.slice(file.originalname.lastIndexOf('.')).toLowerCase();
    if (!ALLOWED_PAYMENT_EXTENSIONS.has(ext)) {
      return cb(new Error(`Invalid file type. Allowed: PDF, JPG, PNG, WEBP.`));
    }
    cb(null, true);
  },
});

const uploadParticipantIds = multer({
  storage,
  limits: { fileSize: MAX_PARTICIPANT_IDS_SIZE },
  fileFilter: (_req, file, cb) => {
    const ext = file.originalname.slice(file.originalname.lastIndexOf('.')).toLowerCase();
    if (ext !== '.pdf') {
      return cb(new Error('Invalid file type. Allowed: PDF.'));
    }
    cb(null, true);
  },
});

/**
 * Express middleware: MIME-sniff uploaded documents using the `file-type` library.
 */
async function validateMimeType(req, res, next) {
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'No file uploaded.' });
  }

  try {
    const { fileTypeFromBuffer } = await import('file-type');
    const detected = await fileTypeFromBuffer(req.file.buffer);

    if (!detected || !ALLOWED_DOCUMENT_MIMES.has(detected.mime)) {
      return res.status(400).json({
        success: false,
        error: `File content does not match an allowed type (PDF, PPT, PPTX). Detected: ${detected?.mime || 'unknown'}.`,
      });
    }

    req.file.detectedMime = detected.mime;
    next();
  } catch (err) {
    console.error('[MIME Sniff] Error:', err.message);
    return res.status(400).json({ success: false, error: 'File validation failed.' });
  }
}

/**
 * Express middleware: MIME-sniff payment receipts (allows images and PDF).
 */
async function validatePaymentMimeType(req, res, next) {
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'No file uploaded.' });
  }

  // If it's a PDF, we can use file-type library. For raw JPEGs/PNGs, 
  // file-type handles them natively too.
  try {
    const { fileTypeFromBuffer } = await import('file-type');
    const detected = await fileTypeFromBuffer(req.file.buffer);

    // If file-type cannot recognize a valid image/pdf header signature, 
    // fall back to checking req.file.mimetype or block it.
    const mimeToCheck = detected ? detected.mime : req.file.mimetype;

    if (!ALLOWED_PAYMENT_MIMES.has(mimeToCheck)) {
      return res.status(400).json({
        success: false,
        error: `Invalid file content. Allowed: PDF, JPG, PNG, WEBP.`,
      });
    }

    req.file.detectedMime = mimeToCheck;
    next();
  } catch (err) {
    console.error('[Payment MIME Sniff] Error:', err.message);
    return res.status(400).json({ success: false, error: 'Payment file validation failed.' });
  }
}

/**
 * Multer error handler. Should be placed after the upload route.
 */
function handleMulterError(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      const isParticipantIdsUpload = req.path === '/register';
      return res.status(400).json({
        success: false,
        error: isParticipantIdsUpload
          ? 'Participant ID proofs PDF must be 1 MB or smaller.'
          : 'Presentation file must be 10 MB or smaller.',
      });
    }
    return res.status(400).json({ success: false, error: `Upload error: ${err.message}` });
  }
  if (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
  next();
}

module.exports = { upload, uploadPayment, uploadPaymentScreenshot, uploadParticipantIds, validateMimeType, validatePaymentMimeType, handleMulterError };