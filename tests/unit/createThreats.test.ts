import { describe, test /* afterEach  */ } from '@jest/globals';
import setupTestDB from '../utils/setupTestDb';
import prisma from '../../src/client';
import mockData from '../mockData';
import threatsController from '../../src/controllers/threats.controller';
import { Prisma } from '@prisma/client';

describe('test createThreats: ', () => {
  setupTestDB();
  const mockThreatFileName = 'MOCK_THREAT_VALID';

  test('valid threat details -> able to create new cylance mock threat in threatDb', async () => {
    const mockThreat = mockData.validThreat;
    mockThreat['file_name'] = mockThreatFileName;
    const result = await threatsController.createThreats([mockThreat]);
    expect(result.count).toBe(1);
  });

  test('threat classification field more than 100 characters -> prisma throws error indicating value is too long. ', async () => {
    const mockThreat = mockData.validThreat;
    mockThreat['file_name'] = mockThreatFileName;
    mockThreat['classification'] = mockData.stringWith101characters;
    try {
      await threatsController.createThreats([mockThreat]);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        const { message } = error;
        const tooLongErrorMsg =
          "The provided value for the column is too long for the column's type.";
        expect(message.includes(tooLongErrorMsg)).toEqual(true);
      }
    }
  });
  afterEach(() => {
    const dropMockThreats = async () => {
      await prisma.threat.deleteMany({
        where: {
          fileName: { in: [mockThreatFileName] }
        }
      });
    };
    dropMockThreats();
  });
});
