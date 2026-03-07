import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const CUSTOMER_LIMITS = { STARTER: 200, PROFESSIONAL: 1000, ENTERPRISE: 0 };

async function main() {
  const superAdminEmail = 'superadmin@platform.com';
  const superAdminHash = await bcrypt.hash('SuperAdmin@123', 10);
  const superAdmin = await prisma.profile.upsert({
    where: { email: superAdminEmail },
    update: { password_hash: superAdminHash, role: 'SUPER_ADMIN', tenant_id: null },
    create: {
      email: superAdminEmail,
      full_name: 'Super Admin',
      password_hash: superAdminHash,
      role: 'SUPER_ADMIN',
      tenant_id: null,
    },
  });
  console.log('Super Admin:', superAdmin.email);

  const tenant = await prisma.tenant.upsert({
    where: { slug: 'babu-isp' },
    update: {},
    create: {
      name: 'Babu ISP',
      slug: 'babu-isp',
      plan: 'ENTERPRISE',
      customer_limit: CUSTOMER_LIMITS.ENTERPRISE,
      is_active: true,
    },
  });
  console.log('Tenant:', tenant.name, '(' + tenant.slug + ')');

  const adminEmail = 'admin@gmail.com';
  const admin = await prisma.profile.upsert({
    where: { email: adminEmail },
    update: { password_hash: await bcrypt.hash('Admin@123', 10), role: 'ADMIN', tenant_id: tenant.id },
    create: {
      email: adminEmail,
      full_name: 'Admin',
      password_hash: await bcrypt.hash('Admin@123', 10),
      role: 'ADMIN',
      tenant_id: tenant.id,
    },
  });
  console.log('ISP Admin:', admin.email);

  const staff = await prisma.profile.upsert({
    where: { email: 'staff@example.com' },
    update: { password_hash: await bcrypt.hash('Staff@123', 10), role: 'STAFF', tenant_id: tenant.id },
    create: {
      email: 'staff@example.com',
      full_name: 'Staff User',
      password_hash: await bcrypt.hash('Staff@123', 10),
      role: 'STAFF',
      tenant_id: tenant.id,
    },
  });
  console.log('Staff:', staff.email);

  const customers = [
    { email: 'musawar@example.com', full_name: 'Musawar', password: 'User@123' },
    { email: 'akbar@example.com', full_name: 'Akbar Ali', password: 'User@123' },
  ];
  for (const u of customers) {
    const hash = await bcrypt.hash(u.password, 10);
    const user = await prisma.profile.upsert({
      where: { email: u.email },
      update: { password_hash: hash, tenant_id: tenant.id },
      create: {
        email: u.email,
        full_name: u.full_name,
        password_hash: hash,
        role: 'USER',
        tenant_id: tenant.id,
      },
    });
    console.log('Customer:', user.email);
  }

  console.log('Seed done.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
