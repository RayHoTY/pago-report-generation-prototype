import { Kafka, logLevel } from 'kafkajs';
import config from '../../config/config';
import logCreatorForMessages from '../../logs/kafka-logger';

// Define new Kafka client with the same broker
export const kafka = new Kafka({
  clientId: config.kafkaClientId,
  brokers: [config.kafkaBrokerLocalHost],
  retry: {
    initialRetryTime: 100,
    retries: 8
  },
  logLevel: logLevel.INFO,
  logCreator: logCreatorForMessages
});
