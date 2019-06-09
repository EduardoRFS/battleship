import { Game } from '../../models';

// TODO: implement
export default async ctx => {
  const payload = ctx.jwt.selfValidate(ctx.request.body);
  const gameObj = {
    owner: { public_key: payload.public_key },
    max_players: payload.max_players,
  };
  ctx.body = await new Game(gameObj).save();
};
