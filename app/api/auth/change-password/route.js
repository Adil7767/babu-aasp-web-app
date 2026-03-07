import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getSession } from '@/lib/auth.js';
import { prisma } from '@/lib/prisma.js';

export async function POST(request) {
  const user = await getSession(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const body = await request.json();
    const { current_password, new_password } = body;
    if (!current_password || !new_password) {
      return NextResponse.json(
        { error: 'Current password and new password are required' },
        { status: 400 }
      );
    }
    if (String(new_password).length < 6) {
      return NextResponse.json(
        { error: 'New password must be at least 6 characters' },
        { status: 400 }
      );
    }
    const profile = await prisma.profile.findUnique({
      where: { id: user.id },
      select: { password_hash: true },
    });
    if (!profile) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const valid = await bcrypt.compare(String(current_password), profile.password_hash);
    if (!valid) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
    }
    const password_hash = await bcrypt.hash(String(new_password), 10);
    await prisma.profile.update({
      where: { id: user.id },
      data: { password_hash },
    });
    return NextResponse.json({ message: 'Password changed successfully' });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
