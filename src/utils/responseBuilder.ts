import { Response } from 'express';
import httpStatus from 'http-status';
import { BadRequestError, ValidationError } from './errors';

// const recommendedSecurityHeaders = {
//   // check that helmet can handle all
// };

const buildResponse = (res: Response, statusCode: number, body: any) => {
  return res.status(statusCode).json(body);
};

const buildErrorResponse = (res: Response, e: Error) => {
  let response: object;
  if (e instanceof BadRequestError) {
    response = buildResponse(res, e.statusCode, e.message);
  } else if (e instanceof ValidationError) {
    response = buildResponse(res, httpStatus.UNPROCESSABLE_ENTITY, e.details);
  } else {
    response = buildResponse(res, httpStatus.INTERNAL_SERVER_ERROR, 'Internal server error.');
  }
  return response;
};

export default {
  buildResponse,
  buildErrorResponse
};
