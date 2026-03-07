/**
 * Image/file upload to S3 or Cloudinary.
 * Set UPLOAD_PROVIDER=s3 or cloudinary and the corresponding env vars.
 */

const PROVIDER = process.env.UPLOAD_PROVIDER || '';

const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export function isUploadConfigured() {
  if (PROVIDER === 's3') {
    return !!(
      process.env.AWS_ACCESS_KEY_ID &&
      process.env.AWS_SECRET_ACCESS_KEY &&
      process.env.AWS_S3_BUCKET &&
      process.env.AWS_REGION
    );
  }
  if (PROVIDER === 'cloudinary') {
    return !!(
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    );
  }
  return false;
}

export function validateFile(file) {
  if (!file || !(file instanceof Blob)) {
    return { ok: false, error: 'No file provided' };
  }
  if (file.size > MAX_SIZE_BYTES) {
    return { ok: false, error: 'File too large (max 5 MB)' };
  }
  const type = file.type?.toLowerCase();
  if (!type || !ALLOWED_TYPES.includes(type)) {
    return { ok: false, error: 'Invalid file type. Use JPEG, PNG, GIF, or WebP.' };
  }
  return { ok: true };
}

/**
 * Upload a file buffer to the configured provider.
 * @param {Buffer} buffer - File content
 * @param {string} mimeType - e.g. image/jpeg
 * @param {string} [folder] - Optional folder/prefix (e.g. avatars, receipts)
 * @returns {Promise<{ url: string }>}
 */
export async function upload(buffer, mimeType, folder = 'uploads') {
  if (!PROVIDER || !isUploadConfigured()) {
    throw new Error('Upload not configured. Set UPLOAD_PROVIDER and provider env vars.');
  }

  if (PROVIDER === 'cloudinary') {
    return uploadToCloudinary(buffer, mimeType, folder);
  }
  if (PROVIDER === 's3') {
    return uploadToS3(buffer, mimeType, folder);
  }

  throw new Error(`Unknown UPLOAD_PROVIDER: ${PROVIDER}. Use s3 or cloudinary.`);
}

async function uploadToCloudinary(buffer, mimeType, folder) {
  const { v2: cloudinary } = await import('cloudinary');
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  const publicId = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  const dataUri = `data:${mimeType};base64,${buffer.toString('base64')}`;

  const result = await cloudinary.uploader.upload(dataUri, {
    folder,
    resource_type: 'image',
    public_id: publicId,
    overwrite: true,
  });

  return { url: result.secure_url };
}

async function uploadToS3(buffer, mimeType, folder) {
  const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3');

  const bucket = process.env.AWS_S3_BUCKET;
  const region = process.env.AWS_REGION || 'us-east-1';
  const baseUrl = process.env.AWS_S3_PUBLIC_URL || `https://${bucket}.s3.${region}.amazonaws.com`;

  const ext = mimeType.split('/')[1] || 'jpg';
  const key = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;

  const client = new S3Client({
    region,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
      ...(process.env.AWS_S3_ACL === 'public-read' && { ACL: 'public-read' }),
    })
  );

  const url = baseUrl.replace(/\/$/, '') + '/' + key;
  return { url };
}
