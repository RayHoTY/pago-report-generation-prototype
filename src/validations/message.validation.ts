import Joi from 'joi';
import threatsValidation from './threats.validation';

const messageValue = Joi.object({
  type: Joi.string().required(), // TODO: allow only specific strings as decided in interfaces
  payload: Joi.alternatives().try(
    threatsValidation.cylanceThreatsPayload,
    threatsValidation.weeklyUpdatedThreatStatus
  ),
  lastFetched: Joi.string().required()
});

export default {
  messageValue
};
