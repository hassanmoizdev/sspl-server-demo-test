import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { seedScenarios } from './scenario_seeder';

const prisma = new PrismaClient();

async function main() {
  // Create default organization if not exists
  const org = await prisma.organization.upsert({
    where: { slug: 'default' },
    update: {},
    create: {
      name: 'Default Organization',
      slug: 'default',
      overview: 'Default organization for seeding users',
    },
  });

  console.log('Default organization created or found:', org.id);

  // Users to seed
  const users = [
    {
      email: 'officebearers@gmail.com',
      password: 'anAdmin@123',
      role: 'OFFICE_BEARERS' as const,
    },
    {
      email: 'abc@example.com',
      password: 'anAdmin@123',
      role: 'USER' as const,
    },
    {
      email: 'super_admin@gmail.com',
      password: 'anAdmin@123',
      role: 'SUPER_ADMIN' as const,
    },
  ];

  for (const user of users) {
    // Hash password
    const hashedPassword = await bcrypt.hash(user.password, 10);

    // Upsert Account
    const account = await prisma.account.upsert({
      where: { email: user.email },
      update: {
        password: hashedPassword,
        status: 'ACTIVE',
      },
      create: {
        email: user.email,
        password: hashedPassword,
        phone: '1234567890',
        status: 'ACTIVE',
      },
    });

    console.log('Account created or updated:', account.email);

    // Upsert Person
    const person = await prisma.person.upsert({
      where: { acc_id: account.id },
      update: {
        first_name: user.email.split('@')[0],
      },
      create: {
        first_name: user.email.split('@')[0],
        acc_id: account.id,
      },
    });

    console.log('Person created or updated for:', account.email);

    // Upsert Profile
    const profile = await prisma.profile.upsert({
      where: {
        owner_id_org_id: {
          owner_id: person.id,
          org_id: org.id,
        },
      },
      update: {},
      create: {
        owner_id: person.id,
        org_id: org.id,
      },
    });

    console.log('Profile created or updated for:', account.email);

    // Upsert Membership
    const membership = await prisma.membership.upsert({
      where: {
        acc_id_org_id: {
          acc_id: account.id,
          org_id: org.id,
        },
      },
      update: {
        role: user.role,
        status: 'ACTIVE',
      },
      create: {
        acc_id: account.id,
        org_id: org.id,
        role: user.role,
        status: 'ACTIVE',
      },
    });

    console.log('Membership created or updated for:', account.email, 'with role:', user.role);
  }

  // Seed Scenarios
  await seedScenarios(prisma);

  console.log('Seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
