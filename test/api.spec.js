/** from https://github.com/inca/koa-router2 */
import request from 'supertest';
import _ from 'lodash/fp';
import jwt from 'jsonwebtoken';
import NodeRSA from 'node-rsa';
import app from '../app';

// all jwt here are self validate

const createPlayer = () => {
  const key = new NodeRSA({ b: 512 });
  key.generateKeyPair(512);
  return {
    private: key.exportKey(),
    publicKey: key.exportKey('public'),
  };
};

// TODO: rate limiter
// e2e test grr
test('game', async () => {
  const server = app.listen();
  // for now owner doesn't do anything, but will be useful to skip turn
  const owner = createPlayer();
  // self validate jwt
  // TODO: allow different sizes of grid
  const ownerToken = jwt.sign(
    { public_key: owner.publicKey, max_players: 2 },
    owner.private,
    {
      algorithm: 'RS256',
    }
  );
  const createBody = await request(server)
    .post('/games')
    .send(ownerToken)
    .set('Content-Type', 'application/jwt')
    .then(_.get('body'));
  const { id } = createBody;
  expect(typeof id).toBe('string');
  expect(id).toHaveLength(24);
  expect(createBody.owner.public_key).toBe(owner.publicKey);
  expect(createBody.state).toBe('joining');
  expect(createBody.max_players).toBe(2);

  const playerOne = createPlayer();
  const playerTwo = createPlayer();

  // self validate jwt
  const joinPlayerOneToken = jwt.sign(
    { public_key: playerOne.publicKey, name: 'playerOne' },
    playerOne.private,
    { algorithm: 'RS256' }
  );
  await request(server)
    .post(`/games/${id}/join`)
    .send(joinPlayerOneToken)
    .set('Content-Type', 'application/jwt')
    .expect(200);

  const joinPlayerTwoToken = jwt.sign(
    { public_key: playerTwo.publicKey, name: 'playerTwo' },
    playerTwo.private,
    { algorithm: 'RS256' }
  );
  await request(server)
    .post(`/games/${id}/join`)
    .send(joinPlayerTwoToken)
    .set('Content-Type', 'application/jwt')
    .expect(200);

  // TODO: spec

  const postJoinBody = await request(server)
    .get(`/games/${id}`)
    .expect(200)
    .then(_.get('body'));
  expect(postJoinBody.state).toBe('placing');
  expect(postJoinBody.players).toEqual([
    {
      public_key: playerOne.publicKey,
      name: 'playerOne',
      placed: false,
      attacks: [],
    },
    {
      public_key: playerTwo.publicKey,
      name: 'playerTwo',
      placed: false,
      attacks: [],
    },
  ]);
  // TODO: test N joins, and test if is in joining, also duplicate joins

  const placePlayerOneToken = jwt.sign(
    {
      public_key: playerOne.publicKey,
      aircraft_carrier: { position: { x: 0, y: 0 }, rotation: 'horizontal' },
      battleship: { position: { x: 0, y: 1 }, rotation: 'horizontal' },
      submarine: { position: { x: 0, y: 2 }, rotation: 'vertical' },
      destroyer: { position: { x: 0, y: 5 }, rotation: 'horizontal' },
      boat: { position: { x: 0, y: 6 }, rotation: 'horizontal' },
    },
    playerOne.private,
    { algorithm: 'RS256' }
  );
  // TODO: test grid size
  const placePlayerTwoToken = jwt.sign(
    {
      // TODO: test invalid positions
      public_key: playerTwo.publicKey,
      aircraft_carrier: { position: { x: 0, y: 0 }, rotation: 'horizontal' },
      battleship: { position: { x: 0, y: 1 }, rotation: 'horizontal' },
      submarine: { position: { x: 0, y: 2 }, rotation: 'horizontal' },
      destroyer: { position: { x: 0, y: 3 }, rotation: 'vertical' },
      boat: { position: { x: 0, y: 6 }, rotation: 'horizontal' },
    },
    playerTwo.private,
    { algorithm: 'RS256' }
  );
  await request(server)
    .post(`/games/${id}/place`)
    .send(placePlayerOneToken)
    .set('Content-Type', 'application/jwt')
    .expect(200);
  await request(server)
    .post(`/games/${id}/place`)
    .send(placePlayerTwoToken)
    .set('Content-Type', 'application/jwt')
    .expect(200);
  // TODO: test if player doesn't exists and try to place without being in placing phase, test if place is valid

  const postPlaceBody = await request(server)
    .get(`/games/${id}`)
    .expect(200)
    .then(_.get('body'));
  expect(postPlaceBody.players).toEqual([
    {
      public_key: playerOne.publicKey,
      name: 'playerOne',
      placed: true,
      positions: {
        aircraft_carrier: { position: { x: 0, y: 0 }, rotation: 'horizontal' },
        battleship: { position: { x: 0, y: 1 }, rotation: 'horizontal' },
        submarine: { position: { x: 0, y: 2 }, rotation: 'vertical' },
        destroyer: { position: { x: 0, y: 5 }, rotation: 'horizontal' },
        boat: { position: { x: 0, y: 6 }, rotation: 'horizontal' },
      },
      attacks: [],
    },
    {
      public_key: playerTwo.publicKey,
      name: 'playerTwo',
      placed: true,
      positions: {
        // TODO: test invalid positions
        aircraft_carrier: { position: { x: 0, y: 0 }, rotation: 'horizontal' },
        battleship: { position: { x: 0, y: 1 }, rotation: 'horizontal' },
        submarine: { position: { x: 0, y: 2 }, rotation: 'horizontal' },
        destroyer: { position: { x: 0, y: 3 }, rotation: 'vertical' },
        boat: { position: { x: 0, y: 6 }, rotation: 'horizontal' },
      },
      attacks: [],
    },
  ]);
  expect(postPlaceBody.state).toBe('battle');

  // TODO: try to attack without being in battle

  const hitPlayerTwoToken = jwt.sign(
    {
      public_key: playerOne.publicKey,
      position: { x: 0, y: 2 },
      player: 1,
    },
    playerOne.private,
    { algorithm: 'RS256' }
  );
  const missPlayerOneToken = jwt.sign(
    {
      // TODO: test invalid positions
      public_key: playerTwo.publicKey,
      position: { x: 8, y: 0 },
      player: 0,
    },
    playerTwo.private,
    { algorithm: 'RS256' }
  );
  // TODO: try to attack two times in the same turn
  await request(server)
    .post(`/games/${id}/attack`)
    .send(hitPlayerTwoToken)
    .set('Content-Type', 'application/jwt')
    .expect(200, { hit: true });
  await request(server)
    .post(`/games/${id}/attack`)
    .send(missPlayerOneToken)
    .set('Content-Type', 'application/jwt')
    .expect(200, { hit: false });
});
// TODO: invalid test, verify if you can send things without valid auth
