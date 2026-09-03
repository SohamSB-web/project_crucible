const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl: awsGetSignedUrl } = require('@aws-sdk/s3-request-presigner');

const BUCKET = process.env.CLOUDFLARE_R2_BUCKET || 'hackathon-submissions';

// Lazy-init S3 client configured for Cloudflare R2
let _r2Client;
function getR2Client() {
  if (!_r2Client) {
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;

    if (!accountId || !accessKeyId || !secretAccessKey) {
      console.warn('[Storage] Cloudflare R2 environment variables not set — file operations will fail.');
      return null;
    }

    if (accessKeyId.length !== 32 || secretAccessKey.length !== 64) {
      throw new Error(
        'Invalid Cloudflare R2 credentials. Access keys must be 32 characters and secrets must be 64 characters. ' +
          'Create an R2 API token and update server/.env.'
      );
    }

    _r2Client = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }
  return _r2Client;
}

/**
 * Upload a file buffer to the private Cloudflare R2 bucket.
 * @param {string} filePath - storage path, e.g. "team-xyz/abstract-v2.pdf"
 * @param {Buffer} buffer   - file contents
 * @param {string} mimeType - validated MIME type
 * @returns {Promise<{ path: string }>}
 */
async function uploadFile(filePath, buffer, mimeType) {
  const client = getR2Client();
  if (!client) {
    throw new Error('Storage is not configured. Check Cloudflare R2 environment variables.');
  }

  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: filePath,
    Body: buffer,
    ContentType: mimeType,
  });

  try {
    await client.send(command);
    return { path: filePath };
  } catch (error) {
    throw new Error(`Cloudflare R2 upload failed: ${error.message}`);
  }
}

/**
 * Generate a short-lived signed URL for a file in Cloudflare R2.
 * @param {string} filePath  - storage path (from Submission.file_path)
 * @param {number} expiresIn - seconds until expiry (default 15 minutes)
 * @returns {Promise<string>} - signed URL
 */
async function getSignedUrl(filePath, expiresIn = 900) {
  const client = getR2Client();
  if (!client) throw new Error('Storage is not configured.');

  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: filePath,
  });

  try {
    const signedUrl = await awsGetSignedUrl(client, command, { expiresIn });
    return signedUrl;
  } catch (error) {
    throw new Error(`Signed URL generation failed: ${error.message}`);
  }
}

/**
 * Delete a file from the bucket (used when overwriting a submission).
 */
async function deleteFile(filePath) {
  const client = getR2Client();
  if (!client) return;

  const command = new DeleteObjectCommand({
    Bucket: BUCKET,
    Key: filePath,
  });

  try {
    await client.send(command);
  } catch (error) {
    console.error('Storage delete warning:', error.message);
  }
}

module.exports = { uploadFile, getSignedUrl, deleteFile };