import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma.js';
import crypto from 'crypto';

const RESET_EXPIRY_HOURS = 1;

export async function POST(request) {
  try {
    const body = await request.json();
    const { email } = body;
    if (!email || !String(email).trim()) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }
    const emailLower = String(email).trim().toLowerCase();
    const profile = await prisma.profile.findUnique({
      where: { email: emailLower },
    });
    if (!profile) {
      return NextResponse.json(
        { message: 'If an account exists with this email, you will receive a reset link.' },
        { status: 200 }
      );
    }
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + RESET_EXPIRY_HOURS);
    await prisma.passwordResetToken.deleteMany({ where: { profile_id: profile.id } });
    await prisma.passwordResetToken.create({
      data: {
        profile_id: profile.id,
        token,
        expires_at: expiresAt,
      },
    });
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL
      || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
    const resetLink = `${baseUrl}/reset-password?token=${token}`;
    if (process.env.SMTP_HOST) {
      // TODO: send email via nodemailer or your email provider
      // await sendEmail(profile.email, 'Reset your password', `Click: ${resetLink}`);
    }
    return NextResponse.json({
      message: 'If an account exists with this email, you will receive a reset link.',
      reset_link: process.env.NODE_ENV !== 'production' ? resetLink : undefined,
    });
  } catch (e) {
    console.error('Forgot password error:', e);
    return NextResponse.json({
      message: 'If an account exists with this email, you will receive a reset link.',
    }, { status: 200 });
  }
}
