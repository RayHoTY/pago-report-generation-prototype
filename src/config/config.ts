import dotenv from 'dotenv';
import dotenvExpand from 'dotenv-expand';
import path from 'path';
import Joi from 'joi';

const envConfig = dotenv.config({ path: path.join(process.cwd(), '.env') });
dotenvExpand.expand(envConfig);

const envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string().valid('production', 'development', 'test').required(),
    PORT: Joi.number().default(3000),
    S3_BUCKET_NAME: Joi.string().required(),
    S3_BUCKET_REGION: Joi.string().required(),
    S3_ENDPOINT: Joi.string().required(),
    S3_ACCESS_KEY: Joi.string().required(),
    S3_SECRET_KEY: Joi.string().required()
  })
  .unknown();

const { value: envVars, error } = envVarsSchema
  .prefs({ errors: { label: 'key' } })
  .validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const dashboardDeviceTenant = process.env.DASHBOARD_DEVICE_TENANT || '';
const dasboardDeviceTenantSuperAdmin = process.env.DASHBOARD_DEVICE_TENANT_SUPER_ADMIN || '';
const kafkaClientId = process.env.KAFKA_CLIENT_ID || '';
const kafkaBrokerLocalHost = process.env.KAFKA_BROKER_LOCALHOST || '';

export default {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  kafkaClientId,
  kafkaBrokerLocalHost,
  dashboardDeviceTenant,
  dasboardDeviceTenantSuperAdmin,
  s3Conn: {
    bucket: envVars.S3_BUCKET_NAME,
    client: {
      region: envVars.S3_BUCKET_REGION,
      credentials: {
        accessKeyId: envVars.S3_ACCESS_KEY,
        secretAccessKey: envVars.S3_SECRET_KEY
      },
      endpoint: envVars.S3_ENDPOINT
    }
  }
};
