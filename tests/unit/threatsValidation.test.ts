import { describe, test, expect } from '@jest/globals';
import mockData from '../mockData';
import threatsValidation from '../../src/validations/threats.validation';

describe('test createSingleThreat validation', () => {
  describe('picks out wrong data types', () => {});

  test('valid threat data - validation passes', async () => {
    const { error } = threatsValidation.cylanceThreats.validate([mockData.validThreat]);
    expect(error).toBeUndefined();
  });
  test('threat data fileSize changed to string - validation throws error', async () => {
    const { error } = threatsValidation.cylanceThreats.validate([mockData.threatInvalidFileSize]);
    expect(error).toBeDefined();
  });
  test('threat data invalid sha256  - validation throws error', async () => {
    const { error } = threatsValidation.cylanceThreats.validate([mockData.threatInvalidSHA]);
    expect(error).toBeDefined();
  });
  test('threat data invalid MD5 - validation throws error', async () => {
    const { error } = threatsValidation.cylanceThreats.validate([mockData.threatInvalidMD5]);
    expect(error).toBeDefined();
  });
  test('threat data invalid IP Addresses - validation throws error', async () => {
    const { error } = threatsValidation.cylanceThreats.validate([mockData.threatInvalidIP]);
    expect(error).toBeDefined();
  });
  test('threat data invalid MAC Addresses - validation throws error', async () => {
    const { error } = threatsValidation.cylanceThreats.validate([mockData.threatInvalidMAC]);
    expect(error).toBeDefined();
  });
});
