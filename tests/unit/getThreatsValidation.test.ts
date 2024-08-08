import { describe, test, expect } from '@jest/globals';
import mockData from '../mockData';
import threatsValidation from '../../src/validations/threats.validation';

describe('test validation for getUnassignedThreats POST request', () => {
  test('valid request body - validation passes', async () => {
    const { error } = threatsValidation.getUnassignedThreats.body.validate(
      mockData.validGetUnassignedThreatsReqBody
    );
    expect(error).toBeUndefined();
  });

  test('invalid request body:negative page index - validation fails', async () => {
    const { error } = threatsValidation.getUnassignedThreats.body.validate(
      mockData.getUnassignedThreatsReqBodyNegativePageIndex
    );
    expect(error).toBeDefined();
  });

  test('invalid request body: page size more than 50 - validation fails', async () => {
    const { error } = threatsValidation.getUnassignedThreats.body.validate(
      mockData.getUnassignedThreatsReqBodyInvalidPageSize
    );
    expect(error).toBeDefined();
  });

  test('invalid request body: search string  more than 50 char - validation fails', async () => {
    const { error } = threatsValidation.getUnassignedThreats.body.validate(
      mockData.getUnassignedThreatsReqBodySearchStringExceed50
    );
    expect(error).toBeDefined();
  });

  test("invalid request body: search string has one or more of the invalid characters ('/', '@', '$', '#')  - validation fails", async () => {
    const { error } = threatsValidation.getUnassignedThreats.body.validate(
      mockData.getUnassignedThreatsReqBodySearchStringInvalidChar
    );
    expect(error).toBeDefined();
  });
});
