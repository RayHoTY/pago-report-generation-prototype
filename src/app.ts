import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
// import httpStatus from 'http-status';
import config from './config/config';
import morgan from './utils/morgan';
import xss from './middlewares/xss';
import routes from './routes/v1';
import { API_PATH } from './constants/routes.constants';
// import { errorHandler } from './middlewares/error';
// import { NotFoundError } from './utils/errors';
// import responseBuilder from './utils/responseBuilder';

const app = express();

if (config.env !== 'test') {
  app.use(morgan.successHandler);
  app.use(morgan.errorHandler);
}

// set security HTTP headers
app.use(helmet());

// parse json request body
app.use(express.json());

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

// sanitize request data
app.use(xss());

// enable cors
app.use(cors());
app.options('*', cors());

// v1 api routes
app.use(API_PATH, routes);

// send back a 404 error for any unknown api request
// app.use((req, res) => {
//   responseBuilder.buildErrorResponse(res, new NotFoundError('Not Found'));
// });

export default app;
