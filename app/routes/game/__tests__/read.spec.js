import request from 'supertest';
import Koa from 'koa';
import config from '../../../config';
import { Game } from '../../../models';
import routes from '../index';

// TODO: test suit
const server = (() => {
  const app = new Koa();
  app.use(config);
  app.use(routes);
  return app.listen();
})();

describe('Read', () => {
  test('found', async () => {
    const game = await new Game({
      max_players: 2,
      owner: { public_key: 'aaa' },
    }).save();
    const { body } = await request(server)
      .get(`/${game.id}`)
      .expect(200);
    expect(body.id).toBe(game.id);
    expect(body.max_players).toBe(2);
    expect(body.owner.public_key).toBe('aaa');
  });
  test('not found', async () => {
    try {
      await request(server)
        .get('/507f191e810c19729de86016')
        .expect(404);
      throw new Error("Shouldn't be here");
    } catch (err) {
      expect(err.message).toBe('Not Found');
    }
  });
  test('invalid', async () => {
    try {
      await request(server).get('/552342542ba23c');
      throw new Error("Shouldn't be here");
    } catch (err) {
      expect(err.status).toBe(404);
      expect(err.message).toBe('Not Found');
    }
  });
});
