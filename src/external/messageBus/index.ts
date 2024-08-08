import {
  IPublishToDeviceServiceMessage,
  IPublishToGateWayMessage
} from '../../interfaces/messageBus.interface';
import logger from '../../logs/logger';
import { kafkaConsume } from './kafkaConsumer';
import {
  // clientMessageProducer,
  kafkaProduce
} from './kafkaProducer';

export const subscribeToMsgBus = async () => {
  kafkaConsume();
};

export const publishToMsgBus = async (
  topic: string,
  payload: IPublishToGateWayMessage | IPublishToDeviceServiceMessage
) => {
  await kafkaProduce(topic, payload);
};

export const initializeMsgBusActions = async () => {
  logger.info(`initializeMsgBus - RUN with no FNs`);
  // await clientMessageProducer.connect();
  // await subscribeToMsgBus();
};
