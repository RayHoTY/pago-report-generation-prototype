import httpStatus from 'http-status';

class BaseError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);

    this.name = Error.name;
    this.statusCode = statusCode;
    Error.captureStackTrace(this);
  }
}

export class BadRequestError extends BaseError {
  constructor(message: string) {
    super(httpStatus.BAD_REQUEST, message);
  }
}

export class NotFoundError extends BaseError {
  constructor(message: string) {
    super(404, message);
  }
}

export class UnauthorizedError extends BaseError {
  constructor(message: string) {
    super(403, message);
  }
}

export class ValidationError extends BaseError {
  details: object;
  constructor(details: object) {
    super(422, 'Validation error');
    this.details = details;
  }
}
