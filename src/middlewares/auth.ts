import { NextFunction, Request, Response } from 'express';

const auth =
  // eslint-disable-next-line @typescript-eslint/no-unused-vars

  () => async (_req: Request, _res: Response, next: NextFunction) => {
    return Promise.resolve()
      .then(() => next())
      .catch((err) => next(err));
  };

export default auth;
