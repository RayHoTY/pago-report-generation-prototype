import { NextFunction, Request, Response } from 'express';
import pick from '../utils/pick';
import Joi from 'joi';
import responseBuilder from '../utils/responseBuilder';
import { ValidationError } from '../utils/errors';

const validate = (schema: object) => (req: Request, res: Response, next: NextFunction) => {
  const validSchema = pick(schema, ['params', 'query', 'body']);
  const obj = pick(req, Object.keys(validSchema));
  const { value, error } = Joi.compile(validSchema)
    .prefs({ errors: { label: 'key' }, abortEarly: false })
    .validate(obj);
  if (error) {
    const { details: rawDetails } = error;
    const errors = rawDetails.reduce((a: object[], c: any) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [_prefix, ...path] = c.path;
      const fieldPath = path.join('.');
      const fieldMessage = c.message.replaceAll(`\"`, '');
      a.push({
        field: fieldPath,
        message: fieldMessage
      });

      return a;
    }, []);
    responseBuilder.buildErrorResponse(res, new ValidationError({ errors }));
  } else {
    const type = Object.keys(value)[0] as 'params' | 'query' | 'body'; // get the key used whether params, query or body;
    req[type] = value[type];
    return next();
  }
};

export default validate;
