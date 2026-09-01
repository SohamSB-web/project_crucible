const { createClient } = require('@supabase/supabase-js');

const BUCKET = process.env.SUPABASE_BUCKET || 'hackathon-submissions';

// Lazy-init Supabase client — allows server to start without env vars (local dev)
let _supabase;
function getSupabase() {
  if (!_supabase) {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
      console.warn('[Storage] SUPABASE_URL / SUPABASE_SERVICE_KEY not set — file operations will fail.');
      return null;
    }
    // Use service role key — this bypasses RLS and is only used server-side
    _supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY,
      { auth: { persistSession: false } }
    );
  }
  return _supabase;
}

/**
 * Upload a file buffer to the private Supabase storage bucket.
 * @param {string} filePath - storage path, e.g. "team-xyz/abstract-v2.pdf"
 * @param {Buffer} buffer   - file contents
 * @param {string} mimeType - validated MIME type
 * @returns {Promise<{ path: string }>}
 */
async function uploadFile(filePath, buffer, mimeType) {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Storage is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_KEY.');

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .upload(filePath, buffer, {
      contentType: mimeType,
      upsert: true, // allow re-submission (versioned path handles uniqueness)
    });

  if (error) {
    throw new Error(`Storage upload failed: ${error.message}`);
  }

  return { path: data.path };
}

/**
 * Generate a short-lived signed URL for a file in the private bucket.
 * @param {string} filePath  - storage path (from Submission.file_path)
 * @param {number} expiresIn - seconds until expiry (default 15 minutes)
 * @returns {Promise<string>} - signed URL
 */
async function getSignedUrl(filePath, expiresIn = 900) {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Storage is not configured.');

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(filePath, expiresIn);

  if (error) {
    throw new Error(`Signed URL generation failed: ${error.message}`);
  }

  return data.signedUrl;
}

/**
 * Delete a file from the bucket (used when overwriting a submission).
 */
async function deleteFile(filePath) {
  const supabase = getSupabase();
  if (!supabase) return;

  const { error } = await supabase.storage.from(BUCKET).remove([filePath]);
  if (error) {
    console.error('Storage delete warning:', error.message);
  }
}

module.exports = { uploadFile, getSignedUrl, deleteFile };
