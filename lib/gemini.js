/**
 * Google Gemini AI (no OpenAI).
 * Get API key: https://aistudio.google.com/apikey
 */

import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GOOGLE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
const defaultModel = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

let ai = null;

function getClient() {
  if (!apiKey) return null;
  if (!ai) ai = new GoogleGenAI({ apiKey });
  return ai;
}

/**
 * Generate text from a prompt using Gemini.
 * @param {string} prompt - User prompt
 * @param {{ model?: string, systemInstruction?: string }} options - Optional model and system instruction
 * @returns {Promise<{ text: string } | { error: string }>}
 */
export async function generateText(prompt, options = {}) {
  const client = getClient();
  if (!client) {
    return { error: 'GOOGLE_GEMINI_API_KEY (or GEMINI_API_KEY) is not set' };
  }
  try {
    const config = {
      model: options.model || defaultModel,
      contents: prompt,
    };
    if (options.systemInstruction) config.systemInstruction = options.systemInstruction;
    const response = await client.models.generateContent(config);
    const text = response?.text ?? '';
    return { text };
  } catch (e) {
    console.error('Gemini generateText error:', e);
    return { error: e?.message || String(e) };
  }
}

/**
 * Multi-turn chat using Gemini (history + new message).
 * @param {{ role: 'user'|'model', parts: { text: string }[] }[]} history - Chat history
 * @param {string} newMessage - New user message
 * @param {{ model?: string }} options
 * @returns {Promise<{ text: string } | { error: string }>}
 */
export async function chat(history, newMessage, options = {}) {
  const client = getClient();
  if (!client) {
    return { error: 'GOOGLE_GEMINI_API_KEY (or GEMINI_API_KEY) is not set' };
  }
  try {
    const contents = [
      ...history.flatMap((h) => h.parts?.map((p) => ({ role: h.role, parts: [{ text: p.text }] })) || []),
      { role: 'user', parts: [{ text: newMessage }] },
    ].filter(Boolean);
    const response = await client.models.generateContent({
      model: options.model || defaultModel,
      contents,
    });
    const text = response?.text ?? '';
    return { text };
  } catch (e) {
    console.error('Gemini chat error:', e);
    return { error: e?.message || String(e) };
  }
}
