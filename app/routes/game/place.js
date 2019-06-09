import _ from 'lodash/fp';
import { BadRequest } from 'http-errors';
import { unitToObject, isInsideGrid, testCollision } from './collision';

const someIsOutside = entries => !entries.map(unitToObject).every(isInsideGrid);
// TODO: easy to optimize and refactor
const hasConflict = entries => item => {
  const others = _.without([item], entries);
  const objectItem = unitToObject(item);
  return others.some(other => {
    const objectOther = unitToObject(other);
    return testCollision(objectItem, objectOther);
  });
};
const validate = positions => {
  const entries = _.entries(positions);

  if (someIsOutside(entries)) {
    throw new BadRequest('Some position is invalid');
  }

  const someSelfConflict = entries.some(hasConflict(entries));
  if (someSelfConflict) {
    throw new BadRequest('Some position is in conflict');
  }
};

export default async ctx => {
  const token = ctx.request.body;
  const { game } = ctx.state;
  const payload = ctx.jwt.selfValidate(token);

  const player = game.findPlayerByKey(payload.public_key);

  if (!player) {
    throw new BadRequest("this player isn't in this game");
  }
  const positions = _.pick(
    ['aircraft_carrier', 'battleship', 'submarine', 'destroyer', 'boat'],
    payload
  );
  validate(positions);

  player.positions = positions;
  player.placed = true;

  ctx.body = await game.save();
};
