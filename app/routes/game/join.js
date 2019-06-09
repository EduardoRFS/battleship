import { Conflict } from 'http-errors';

export default async ctx => {
  const token = ctx.request.body;
  const { game } = ctx.state;
  const payload = ctx.jwt.selfValidate(token);

  // validations
  if (game.state !== 'joining') {
    throw new Conflict('Game already started');
  }
  const player = await game.findPlayerByKey(payload.public_key);
  if (player) {
    throw new Conflict('You already joined this game');
  }

  game.players.push({
    public_key: payload.public_key,
    name: payload.name || 'anonymous',
    places: null,
    attacks: [],
  });
  ctx.body = await game.save();
};
