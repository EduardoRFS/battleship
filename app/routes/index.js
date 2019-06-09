import Router from 'koa-Router';
import gameRouter from './game';

const router = new Router();

router.use('/games', gameRouter);

export default router;
