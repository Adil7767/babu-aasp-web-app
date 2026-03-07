import { prisma } from './prisma.js';

export async function createAuditLog(opts) {
  const { tenantId, userId, action, entityType, entityId = null, payload = null } = opts || {};
  if (!tenantId || !userId || !action || !entityType) return;
  try {
    await prisma.auditLog.create({
      data: {
        tenant_id: tenantId,
        user_id: userId,
        action,
        entity_type: entityType,
        entity_id: entityId,
        payload: payload ? JSON.parse(JSON.stringify(payload)) : undefined,
      },
    });
  } catch (e) {
    console.error('Audit log create failed:', e);
  }
}
