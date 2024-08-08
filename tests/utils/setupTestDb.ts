import prisma from '../../src/client';
import { beforeAll, beforeEach, afterAll } from '@jest/globals';

const setupTestDB = () => {
  beforeAll(async () => {
    await prisma.$connect();
  });

  beforeEach(async () => {});

  afterAll(async () => {
    await prisma.$disconnect();
  });
};

export default setupTestDB;
