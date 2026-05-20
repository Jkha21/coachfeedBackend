import express, { IRouter } from 'express';
const router = express.Router();

import feedRoute from './feed.route';

/**
 * Function contains Application routes
 *
 * @returns router
 */
const routes = (): IRouter => {
  router.use('/posts', new feedRoute().getRoutes());

  return router;
};

export default routes;
