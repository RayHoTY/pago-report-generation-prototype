import { describe, test, expect } from '@jest/globals';
import mockData from '../mockData';
import messageValidation from '../../src/validations/message.validation';

describe('test threats message validation', () => {
  describe('picks out wrong data types for different fields', () => {});

  test('valid threat message - validation passes', async () => {
    const { error } = messageValidation.messageValue.validate(mockData.validThreatsMessage);
    expect(error).toBeUndefined();
  });

  test('valid threat message - validation throws error', async () => {
    const { error } = messageValidation.messageValue.validate(
      mockData.threatsMessageTypeIsEmptyString
    );
    expect(error).toBeDefined();
  });
});
