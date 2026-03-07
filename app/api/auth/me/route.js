import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth.js';

export async function GET(request) {
  const user = await getSession(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.json(user);
}
