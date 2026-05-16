import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const ROUNDS = Number(process.env.BCRYPT_ROUNDS ?? 10);

const users = [
  { email: 'admin@polysignal.test', password: 'Admin123!' },
  { email: 'user@polysignal.test', password: 'User123!' },
];

const run = async () => {
  for (const u of users) {
    const passwordHash = await bcrypt.hash(u.password, ROUNDS);
    const record = await prisma.user.upsert({
      where: { email: u.email },
      update: { passwordHash, isActive: true },
      create: { email: u.email, passwordHash, isActive: true },
    });
    console.log(`seeded user ${record.email} (id=${record.id})`);
  }
};

run()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
