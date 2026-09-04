import * as bcrypt from 'bcryptjs';
import { PrismaPg } from '@prisma/adapter-pg';
import { env } from '../config/env';
import { PrismaClient, UserRole } from '../generated/prisma/client';

const SALT_ROUNDS = 10;

async function upsertUser(
  prisma: PrismaClient,
  role: UserRole,
  phone: string | undefined,
  password: string | undefined,
  name: string,
) {
  if (!phone || !password) {
    return null;
  }
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  return prisma.user.upsert({
    where: { phone },
    update: {},
    create: { phone, passwordHash, name, role },
  });
}

async function main() {
  const ownerPhone = process.env.SEED_OWNER_PHONE;
  const ownerPassword = process.env.SEED_OWNER_PASSWORD;
  const ownerName = process.env.SEED_OWNER_NAME ?? 'Владелец магазина';

  if (!ownerPhone || !ownerPassword) {
    throw new Error(
      'SEED_OWNER_PHONE и SEED_OWNER_PASSWORD должны быть заданы в .env',
    );
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: env.databaseUrl }),
  });

  const owner = await upsertUser(
    prisma,
    UserRole.OWNER,
    ownerPhone,
    ownerPassword,
    ownerName,
  );
  console.log(`Пользователь OWNER готов: ${owner!.phone} (${owner!.name})`);

  const manager = await upsertUser(
    prisma,
    UserRole.MANAGER,
    process.env.SEED_MANAGER_PHONE,
    process.env.SEED_MANAGER_PASSWORD,
    process.env.SEED_MANAGER_NAME ?? 'Менеджер магазина',
  );
  if (manager) {
    console.log(`Пользователь MANAGER готов: ${manager.phone} (${manager.name})`);
  } else {
    console.log(
      'MANAGER не создан — задайте SEED_MANAGER_PHONE и SEED_MANAGER_PASSWORD в .env, если он нужен',
    );
  }

  await prisma.$disconnect();
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
