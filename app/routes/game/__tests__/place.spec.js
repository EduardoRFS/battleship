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
const createGame = async () => {
  const players = _.times(createPlayer, 2);
  const game = await new Game({
    max_players: 2,
    owner: { public_key: 'aaa' },
    players: players.map((player, index) => ({
      public_key: player.publicKey,
      name: `Player ${index}`,
      attacks: [],
    })),
  }).save();
  return { players, game };
};
const options = { algorithm: 'RS256' };

describe('Place', () => {
  test('valid', async () => {
    const { game, players } = await createGame();
    const playerOnePositions = {
      aircraft_carrier: { position: { x: 0, y: 0 }, rotation: 'horizontal' },
      battleship: { position: { x: 0, y: 1 }, rotation: 'horizontal' },
      submarine: { position: { x: 0, y: 2 }, rotation: 'vertical' },
      destroyer: { position: { x: 0, y: 5 }, rotation: 'horizontal' },
      boat: { position: { x: 0, y: 6 }, rotation: 'horizontal' },
    };
    const playerTwoPositions = {
      aircraft_carrier: { position: { x: 0, y: 0 }, rotation: 'horizontal' },
      battleship: { position: { x: 0, y: 1 }, rotation: 'horizontal' },
      submarine: { position: { x: 0, y: 2 }, rotation: 'horizontal' },
      destroyer: { position: { x: 0, y: 3 }, rotation: 'vertical' },
      boat: { position: { x: 0, y: 6 }, rotation: 'horizontal' },
    };
    {
      const player = players[0];
      const token = jwt.sign(
        {
          public_key: player.publicKey,
          ...playerOnePositions,
        },
        player.private,
        options
      );
      await request(server)
        .post(`/${game.id}/place`)
        .send(token)
        .set('Content-Type', 'application/jwt')
        .expect(200);
    }
    {
      const player = players[1];
      const token = jwt.sign(
        {
          public_key: player.publicKey,
          ...playerTwoPositions,
        },
        player.private,
        options
      );
      await request(server)
        .post(`/${game.id}/place`)
        .send(token)
        .set('Content-Type', 'application/jwt')
        .expect(200);
    }
    const gameUpdated = await Game.findById(game.id).lean();
    expect(gameUpdated.state).toBe('battle');

    const positions = _.map('positions', gameUpdated.players);
    expect(positions).toEqual([playerOnePositions, playerTwoPositions]);
  });
  test('invalid position', async () => {
    const { game, players } = await createGame();
    const outOfGrid = {
      aircraft_carrier: { position: { x: 6, y: 0 }, rotation: 'horizontal' },
      battleship: { position: { x: 0, y: 1 }, rotation: 'horizontal' },
      submarine: { position: { x: 0, y: 2 }, rotation: 'horizontal' },
      destroyer: { position: { x: 0, y: 3 }, rotation: 'vertical' },
      boat: { position: { x: 0, y: 6 }, rotation: 'horizontal' },
    };
    const [player] = players;
    const token = jwt.sign(
      { public_key: player.publicKey, ...outOfGrid },
      player.private,
      options
    );
    const response = await request(server)
      .post(`/${game.id}/place`)
      .send(token)
      .set('Content-Type', 'application/jwt')
      .expect(400);
    const message = response.body.error;
    expect(message).toBe('Some position is invalid');
  });
  test('conflict position', async () => {
    const { game, players } = await createGame();
    const conflictPosition = {
      aircraft_carrier: { position: { x: 6, y: 0 }, rotation: 'vertical' },
      battleship: { position: { x: 4, y: 2 }, rotation: 'horizontal' },
      submarine: { position: { x: 0, y: 2 }, rotation: 'horizontal' },
      destroyer: { position: { x: 0, y: 3 }, rotation: 'vertical' },
      boat: { position: { x: 0, y: 6 }, rotation: 'horizontal' },
    };
    const [player] = players;
    const token = jwt.sign(
      { public_key: player.publicKey, ...conflictPosition },
      player.private,
      options
    );
    const response = await request(server)
      .post(`/${game.id}/place`)
      .send(token)
      .set('Content-Type', 'application/jwt')
      .expect(400);
    const message = response.body.error;
    expect(message).toBe('Some position is in conflict');
  });
  // TODO: validate fields and rotation using json schema
});
