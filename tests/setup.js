export const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

export async function api(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

export const seed = {
  admin: { email: 'admin@gmail.com', password: 'Admin@123' },
  staff: { email: 'staff@example.com', password: 'Staff@123' },
  customer: { email: 'musawar@example.com', password: 'User@123' },
  superAdmin: { email: 'superadmin@platform.com', password: 'SuperAdmin@123' },
};
