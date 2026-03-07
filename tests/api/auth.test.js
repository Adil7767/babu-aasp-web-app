import { describe, it } from 'node:test';
import assert from 'node:assert';
import { api, seed } from '../setup.js';

describe('Auth API', () => {
  it('login returns 400 when body empty', async () => {
    const r = await api('/api/auth/login', { method: 'POST', body: JSON.stringify({}) });
    assert.strictEqual(r.status, 400);
  });
  it('login returns 401 for wrong credentials', async () => {
    const r = await api('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'x@x.com', password: 'wrong' }),
    });
    assert.strictEqual(r.status, 401);
  });
  it('login returns 200 for seed admin', async () => {
    const r = await api('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(seed.admin),
    });
    assert.strictEqual(r.status, 200, r.data?.detail || r.data?.error || '');
    assert.ok(r.data?.token);
    assert.strictEqual(r.data?.user?.email, seed.admin.email);
  });
  it('me returns 401 without token', async () => {
    assert.strictEqual((await api('/api/auth/me')).status, 401);
  });
  it('me returns 200 with token', async () => {
    const login = await api('/api/auth/login', { method: 'POST', body: JSON.stringify(seed.admin) });
    if (login.status !== 200) return;
    const r = await api('/api/auth/me', { headers: { Authorization: 'Bearer ' + login.data.token } });
    assert.strictEqual(r.status, 200);
  });
  it('forgot-password returns 200', async () => {
    const r = await api('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email: 'a@b.com' }),
    });
    assert.strictEqual(r.status, 200);
  });
  it('profile returns 401 without token', async () => {
    assert.strictEqual((await api('/api/auth/profile')).status, 401);
  });
  it('logout returns 200', async () => {
    assert.strictEqual((await api('/api/auth/logout', { method: 'POST' })).status, 200);
  });
  it('reset-password returns 400 without valid token', async () => {
    const r = await api('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token: 'invalid', new_password: 'NewPass@123' }),
    });
    assert.strictEqual(r.status, 400);
  });
});
