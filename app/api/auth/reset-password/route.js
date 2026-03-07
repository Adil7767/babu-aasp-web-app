import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma.js';

export async function POST(request) {
  try {
    const body = await request.json();
    const { token, new_password } = body;
    if (!token || !new_password || String(new_password).length < 6) {
      return NextResponse.json(
        { error: 'Valid token and new password (min 6 characters) are required' },
        { status: 400 }
      );
    }
    const record = await prisma.passwordResetToken.findUnique({
      where: { token: String(token).trim() },
      include: { profile: true },
    });
    if (!record) {
      return NextResponse.json({ error: 'Invalid or expired reset link' }, { status: 400 });
    }
    if (new Date(record.expires_at) < new Date()) {
      await prisma.passwordResetToken.delete({ where: { id: record.id } });
      return NextResponse.json({ error: 'Reset link has expired' }, { status: 400 });
    }
    const password_hash = await bcrypt.hash(String(new_password), 10);
    await prisma.profile.update({
      where: { id: record.profile_id },
      data: { password_hash },
    });
    await prisma.passwordResetToken.delete({ where: { id: record.id } });
    return NextResponse.json({ message: 'Password reset successfully. You can now sign in.' });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
