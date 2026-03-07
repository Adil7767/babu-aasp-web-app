import { describe, it } from 'node:test';
import assert from 'node:assert';
import { api } from '../setup.js';

describe('Plans API', () => {
  it('GET /api/plans returns 200 and array', async () => {
    const r = await api('/api/plans');
    assert.strictEqual(r.status, 200);
    assert.ok(Array.isArray(r.data));
    assert.ok(r.data.length >= 1);
    assert.ok(r.data[0].id);
    assert.ok(r.data[0].name);
  });

  it('GET /api/plans?payment_details=true returns plans and payment_instructions', async () => {
    const r = await api('/api/plans?payment_details=true');
    assert.strictEqual(r.status, 200);
    assert.ok(r.data.plans);
    assert.ok(r.data.payment_instructions);
  });
});
