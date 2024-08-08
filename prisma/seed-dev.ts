import { PrismaClient } from '@prisma/client';
import logger from '../src/logs/logger';
import { upsert2UnassignedThreatSeeds } from './helpers/unassigned.seed-dev';
import { upsert3QuarantinedThreatSeeds } from './helpers/quarantined.seed-dev';
import { upsert4SafelistedThreatSeeds } from './helpers/safelisted.seed-dev';

const prisma = new PrismaClient();

const main = async () => {
  await upsert2UnassignedThreatSeeds();

  await upsert3QuarantinedThreatSeeds();

  await upsert4SafelistedThreatSeeds();
};

(async () => {
  try {
    await main();
    await prisma.$disconnect();
  } catch (e) {
    logger.error(e);
    await prisma.$disconnect();
    process.exit(1);
  }
})();
