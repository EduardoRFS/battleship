import Router from 'koa-Router';
import error from 'koa-error';
import morgan from 'koa-morgan';
import json from 'koa-json';
import bodyParser from 'koa-bodyparser';
import jwt from './jwt';

const router = new Router();

router.use(error({ accepts: ['json', 'text', 'html'] }));
if (process.env.NODE_ENV !== 'test') {
  router.use(morgan('dev'));
}
router.use(json());
router.use(
  bodyParser({
    enableTypes: ['json', 'form', 'text'],
    extendTypes: {
      text: ['application/jwt'], // will parse application/x-javascript type body as a JSON string
    },
  })
);
router.use(jwt);

export default router;
