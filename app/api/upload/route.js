import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth.js';
import { isUploadConfigured, validateFile, upload } from '@/lib/upload.js';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  const user = await getSession(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!isUploadConfigured()) {
    return NextResponse.json(
      { error: 'Image upload is not configured. Set UPLOAD_PROVIDER and provider env vars.' },
      { status: 503 }
    );
  }

  let formData;
  try {
    formData = await request.formData();
  } catch (e) {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 });
  }

  const file = formData.get('file');
  const folder = (formData.get('folder') || 'uploads').toString().replace(/[^a-z0-9_-]/gi, '') || 'uploads';

  if (!file || !(file instanceof Blob)) {
    return NextResponse.json({ error: 'No file provided. Use form field "file".' }, { status: 400 });
  }

  const validation = validateFile(file);
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const { url } = await upload(buffer, file.type, folder);
    return NextResponse.json({ url });
  } catch (e) {
    console.error('Upload error:', e);
    return NextResponse.json(
      { error: e.message || 'Upload failed' },
      { status: 500 }
    );
  }
}
