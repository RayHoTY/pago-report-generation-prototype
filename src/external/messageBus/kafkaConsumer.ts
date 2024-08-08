import messageHandler from '../../utils/messageHandler';
import { TOPIC } from '../../constants/messageBus.constants';
import logger from '../../logs/logger';
import { kafka } from './kafka';

const consumer = kafka.consumer({ groupId: 'threatmgmt-consumers' });

export const kafkaConsume = async () => {
  await consumer.connect();
  await consumer.subscribe({ topics: [TOPIC.GATEWAY_THREATS], fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ /* topic, partition, */ topic, message }) => {
      if (message !== null && message.value) {
        //messageValue is a Buffer data type
        const messageValue = JSON.parse(message.value.toString());
        if (messageValue) {
          logger.info(`ThreatMgmt Service has received a message from topic: ${topic}`);
          await messageHandler.handleMessage(messageValue);
        }
      }
    }
  });
};
