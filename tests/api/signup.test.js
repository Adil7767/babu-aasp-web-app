import { describe, it } from 'node:test';
import assert from 'node:assert';
import { api } from '../setup.js';

describe('Signup API', () => {
  it('returns 400 when required fields missing', async () => {
    const r = await api('/api/signup', { method: 'POST', body: JSON.stringify({ email: 'x@x.com' }) });
    assert.strictEqual(r.status, 400);
  });

  it('returns 400 when email already registered', async () => {
    const r = await api('/api/signup', {
      method: 'POST',
      body: JSON.stringify({
        company_name: 'Test',
        email: 'admin@gmail.com',
        password: 'Pass@123',
        full_name: 'Test',
        plan: 'STARTER',
      }),
    });
    assert.strictEqual(r.status, 400);
  });
});
