import express from 'express';
import docsRoute from './docs.route';
import config from '../../config/config';
import { API } from '../../constants/routes.constants';
import threatsRoute from './threats.route';
const router = express.Router();

const defaultRoutes = [
  {
    path: API.THREATS,
    route: threatsRoute
  }
];

const devRoutes = [
  // routes available only in development mode
  {
    path: API.DOCS,
    route: docsRoute
  }
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

/* istanbul ignore next */
if (config.env === 'development') {
  devRoutes.forEach((route) => {
    router.use(route.path, route.route);
  });
}

export default router;
