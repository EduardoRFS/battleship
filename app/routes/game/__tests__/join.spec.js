import _ from 'lodash/fp';
import request from 'supertest';
import Koa from 'koa';
import jwt from 'jsonwebtoken';
import NodeRSA from 'node-rsa';
import config from '../../../config';
import { Game } from '../../../models';
import routes from '../index';

// TODO: test suit
const createPlayer = () => {
  const key = new NodeRSA({ b: 512 });
  key.generateKeyPair(512);
  return {
    private: key.exportKey(),
    publicKey: key.exportKey('public'),
  };
};
const server = (() => {
  const app = new Koa();
  app.use(config);
  app.use(routes);
  return app.listen();
})();
const createGame = (players = 2) =>
  new Game({
    max_players: players,
    owner: { public_key: 'aaa' },
  }).save();
const options = { algorithm: 'RS256' };

describe('Join', () => {
  test('simple', async () => {
    const game = await createGame();
    const players = _.times(createPlayer, 2);
    const tokens = players.map((player, index) =>
      jwt.sign(
        {
          public_key: player.publicKey,
          name: `Player ${index}`,
        },
        player.private,
        options
      )
    );
    await request(server)
      .post(`/${game.id}/join`)
      .send(tokens[0])
      .set('Content-Type', 'application/jwt')
      .expect(200);
    await request(server)
      .post(`/${game.id}/join`)
      .send(tokens[1])
      .set('Content-Type', 'application/jwt')
      .expect(200);
  });
  test('overjoin', async () => {
    const game = await createGame();
    const players = _.times(createPlayer, 3);
    const tokens = players.map((player, index) =>
      jwt.sign(
        {
          public_key: player.publicKey,
          name: `Player ${index}`,
        },
        player.private,
        options
      )
    );
    await request(server)
      .post(`/${game.id}/join`)
      .send(tokens[0])
      .set('Content-Type', 'application/jwt')
      .expect(200);
    await request(server)
      .post(`/${game.id}/join`)
      .send(tokens[1])
      .set('Content-Type', 'application/jwt')
      .expect(200);
    const response = await request(server)
      .post(`/${game.id}/join`)
      .send(tokens[2])
      .set('Content-Type', 'application/jwt')
      .expect(409);
    const message = response.body.error;
    expect(message).toBe('Game already started');
  });
  test('duplicated', async () => {
    const game = await createGame();
    const player = createPlayer();
    const token = jwt.sign(
      {
        public_key: player.publicKey,
        name: `Player`,
      },
      player.private,
      options
    );
    await request(server)
      .post(`/${game.id}/join`)
      .send(token)
      .set('Content-Type', 'application/jwt')
      .expect(200);
    const response = await request(server)
      .post(`/${game.id}/join`)
      .send(token)
      .set('Content-Type', 'application/jwt')
      .expect(409);
    const message = response.body.error;
    expect(message).toBe('You already joined this game');
  });
});
