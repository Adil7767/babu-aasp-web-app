import { describe, it } from 'node:test';
import assert from 'node:assert';
import { api, seed } from '../setup.js';

async function getAdminToken() {
  const login = await api('/api/auth/login', { method: 'POST', body: JSON.stringify(seed.admin) });
  return login.status === 200 ? login.data.token : null;
}

describe('Users and Tenant API', () => {
  it('GET /api/users returns 401 without token', async () => {
    assert.strictEqual((await api('/api/users')).status, 401);
  });
  it('GET /api/users returns 200 with admin token', async () => {
    const token = await getAdminToken();
    if (!token) return;
    const r = await api('/api/users', { headers: { Authorization: 'Bearer ' + token } });
    assert.strictEqual(r.status, 200);
    assert.ok(Array.isArray(r.data));
  });
  it('GET /api/tenant returns 200 with admin token', async () => {
    const token = await getAdminToken();
    if (!token) return;
    const r = await api('/api/tenant', { headers: { Authorization: 'Bearer ' + token } });
    assert.strictEqual(r.status, 200);
    assert.ok(r.data.id);
    assert.ok(r.data.subscription_status != null);
  });
  it('GET /api/stats returns 200 or 402 with admin token', async () => {
    const token = await getAdminToken();
    if (!token) return;
    const r = await api('/api/stats', { headers: { Authorization: 'Bearer ' + token } });
    assert.ok(r.status === 200 || r.status === 402);
  });
});
