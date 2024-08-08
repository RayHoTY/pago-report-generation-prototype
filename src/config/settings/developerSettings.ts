import _ from 'lodash';
import { IYamlConfigModel } from '../../interfaces/config.interface';
import * as fs from 'fs';
import yaml from 'js-yaml';
import { setAutoTopicCreation } from '../../interfaces/appSetting.interface';

export function getSettingsFromDeveloperSettings() {
  const configDetails = getDeveloperConfig();
  setDeveloperValues(configDetails);
  return configDetails;
}
function getDeveloperConfig() {
  const configFileResult = yaml.load(fs.readFileSync('./config.yaml', 'utf-8')) as IYamlConfigModel;
  [];

  if (_.isEmpty(configFileResult) || _.isNil(configFileResult)) {
    throw new Error(`config file is empty or null`);
  }

  return configFileResult;
}

function setDeveloperValues(configFileResult: IYamlConfigModel) {
  // Set KafkaProducer autoTopicCreation
  setAutoTopicCreation(configFileResult.autoTopicCreation);
}
