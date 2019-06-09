import { NotFound } from 'http-errors';
import { CastError } from 'mongoose';
import { Game } from '../../models';

export default async (ctx, next) => {
  const { id } = ctx.params;
  try {
    const game = await Game.findById(id);
    if (!game) {
      return null;
    }
    ctx.state.game = game;
    return next();
  } catch (err) {
    if (err instanceof CastError) {
      throw new NotFound('Not found');
    }
  }
};
