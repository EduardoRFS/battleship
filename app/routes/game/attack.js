import _ from 'lodash/fp';
import { BadRequest } from 'http-errors';
import { createObject, unitToObject, testCollision } from './collision';

// TODO: ok technically this can and should be running at front
const createShot = ({ x, y }) => createObject(x, y, 1, 1);
const testHit = (shot, units) =>
  _.entries(units)
    .map(unitToObject)
    .some(obj => testCollision(obj, shot));
export default async ctx => {
  const token = ctx.request.body;
  const { game } = ctx.state;
  const payload = ctx.jwt.selfValidate(token);

  const player = game.findPlayerByKey(payload.public_key);

  if (!player) {
    throw new BadRequest("this player isn't in this game");
  }

  const targetPlayer = game.players[payload.player];
  const shotObject = createShot(payload.position);
  const hit = testHit(shotObject, targetPlayer.positions.toObject());
  player.attacks.push({
    position: payload.position,
    player: payload.player,
    hit,
  });

  await game.save();
  // TODO: validate if is you turn to play

  ctx.body = { hit };
};
