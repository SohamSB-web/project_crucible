const multer = require('multer');

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB

const ALLOWED_MIMES = new Set([
  'application/pdf',
  'application/vnd.ms-powerpoint',                                                   // .ppt
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',       // .pptx
]);

const ALLOWED_EXTENSIONS = new Set(['.pdf', '.ppt', '.pptx']);

// Store in memory so we can MIME-sniff before uploading to Supabase
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_req, file, cb) => {
    const ext = file.originalname.slice(file.originalname.lastIndexOf('.')).toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return cb(new Error(`Invalid file type. Allowed: PDF, PPT, PPTX.`));
    }
    cb(null, true);
  },
});

/**
 * Express middleware: MIME-sniff the uploaded buffer using the `file-type` library.
 * This detects disguised files (e.g. a .exe renamed to .pdf).
 * Must run AFTER multer has placed the buffer at req.file.buffer.
 *
 * file-type v19+ is ESM-only so we use a dynamic import().
 */
async function validateMimeType(req, res, next) {
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'No file uploaded.' });
  }

  try {
    // Dynamic import because file-type v19+ is ESM-only
    const { fileTypeFromBuffer } = await import('file-type');
    const detected = await fileTypeFromBuffer(req.file.buffer);

    if (!detected || !ALLOWED_MIMES.has(detected.mime)) {
      return res.status(400).json({
        success: false,
        error: `File content does not match an allowed type (PDF, PPT, PPTX). Detected: ${detected?.mime || 'unknown'}.`,
      });
    }

    // Attach the sniffed MIME to req.file for downstream use
    req.file.detectedMime = detected.mime;
    next();
  } catch (err) {
    console.error('[MIME Sniff] Error:', err.message);
    return res.status(400).json({ success: false, error: 'File validation failed.' });
  }
}

/**
 * Multer error handler. Should be placed after the upload route.
 */
function handleMulterError(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ success: false, error: 'File exceeds the 20MB size limit.' });
    }
    return res.status(400).json({ success: false, error: `Upload error: ${err.message}` });
  }
  if (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
  next();
}

module.exports = { upload, validateMimeType, handleMulterError };
