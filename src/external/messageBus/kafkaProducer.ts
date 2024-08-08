import { Partitioners } from 'kafkajs';
import { getSettingsFromDeveloperSettings } from '../../config/settings/developerSettings';
import { kafka } from './kafka';
import {
  IPublishToDeviceServiceMessage,
  IPublishToGateWayMessage
} from '../../interfaces/messageBus.interface';

// Create a Kafka producer & Produce message to a topic
export const clientMessageProducer = kafka.producer({
  createPartitioner: Partitioners.DefaultPartitioner,
  allowAutoTopicCreation: getSettingsFromDeveloperSettings().autoTopicCreation
});

export const kafkaProduce = async (
  topic: string,
  payload: IPublishToGateWayMessage | IPublishToDeviceServiceMessage
) => {
  const payloadString = JSON.stringify(payload);
  await clientMessageProducer.send({
    topic,
    messages: [{ value: payloadString }]
  });
};
