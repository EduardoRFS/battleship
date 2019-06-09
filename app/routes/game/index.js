import Router from 'koa-Router';
import create from './create';
import load from './load';
import read from './read';
import join from './join';
import place from './place';
import attack from './attack';

const router = new Router();

router.post('/', create);
router.use('/:id', load);
// TODO: think about pagination
router.get('/:id', read);
router.post('/:id/join', join);
// TODO: perhaps allow overwrite place at start?
router.post('/:id/place', place);
router.post('/:id/attack', attack);

export default router;
