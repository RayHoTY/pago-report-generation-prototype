import { MESSAGE_TYPE } from '../constants/messageBus.constants';
import { IMessageCylanceThreats } from '../interfaces/messageBus.interface';
import {
  IThreatsFullPayload,
  IThreatsMessagePayload,
  IWeeklyUpdatedThreatStatus
} from '../interfaces/threats.interfaces';
import logger from '../logs/logger';
import { threatService } from '../services';
import { messageValidation } from '../validations';

/**
 * Handles messages received from messageBus
 */

const handleMessage = async (messageValue: IMessageCylanceThreats) => {
  try {
    const { error } = messageValidation.messageValue.validate(messageValue);

    if (error) {
      logger.error(`Message Value received failed validation: ${JSON.stringify(error.details)}`);
    } else {
      const { type } = messageValue;
      if (!type) return;
      switch (type) {
        case MESSAGE_TYPE.PUSHED_THREATS:
          logger.info(`received message,  type: ${type}`);
          const newThreatsPayload = messageValue.payload as IThreatsMessagePayload;
          if (newThreatsPayload.threats) {
            const { threats } = newThreatsPayload;
            if (threats.length > 0) {
              await threatService.createThreats(threats as IThreatsFullPayload[]);
            }
          }
          break;
        case MESSAGE_TYPE.PUSHED_THREATS_WEEKLY_UPDATE:
          logger.info(`received message,  type: ${type}`);
          const weeklyUpdatedThreats = messageValue.payload as IWeeklyUpdatedThreatStatus;
          await threatService.weeklyUpdateOfThreatStatus(weeklyUpdatedThreats);
          break;
        default:
          logger.error('THREAT MESSAGE CONSUMER: RECEIVED INVALID MESSAGE TYPE.');
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      return error; // TODO: errorhandling
    }
  }
};

export default {
  handleMessage
};
