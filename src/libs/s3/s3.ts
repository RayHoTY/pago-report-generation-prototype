import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import logger from '../../logs/logger';
import config from '../../config/config';

const getFileFromS3 = async (fileName: string) => {
  let result;
  try {
    logger.info('Getting file from S3 bucket - START');
    const s3Client = new S3Client(config.s3Conn.client);
    const command = new GetObjectCommand({
      Bucket: config.s3Conn.bucket,
      Key: fileName
    });
    const outcome = await s3Client.send(command);
    logger.debug(`Get file from S3 outcome: ${outcome}`);
    logger.info('Getting file from S3 bucket - END');
    result = outcome.Body;
  } catch (error) {
    logger.error(`Error getting file from S3 ${error} ${(error as Error).stack}`);
  }
  return result;
};

export default { getFileFromS3 };
