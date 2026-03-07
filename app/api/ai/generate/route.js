/**
 * Generate text using Google Gemini (no OpenAI).
 * POST /api/ai/generate { "prompt": "..." }
 */

import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth.js';
import { generateText } from '@/lib/gemini.js';

export async function POST(request) {
  const user = await getSession(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const body = await request.json();
    const { prompt, model, systemInstruction } = body || {};
    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'prompt (string) is required' },
        { status: 400 }
      );
    }
    const result = await generateText(prompt.trim(), {
      model: model || undefined,
      systemInstruction: systemInstruction || undefined,
    });
    if (result.error) {
      return NextResponse.json(
        { error: 'AI error', detail: result.error },
        { status: 502 }
      );
    }
    return NextResponse.json({ text: result.text });
  } catch (e) {
    console.error('AI generate error:', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
