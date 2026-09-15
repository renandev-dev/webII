import 'dotenv/config';

import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma/client.ts';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL não foi definida no arquivo .env');
}

const isDevelopment = process.env.NODE_ENV !== 'production';

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
  log: isDevelopment
    ? ['query', 'warn', 'error']
    : ['warn', 'error'],
});

export default prisma;