import mongoose from 'mongoose';
import config from '../../config';
import Game from './Game';

const env = process.env.NODE_ENV || 'development';
const { DB } = config[env];

mongoose.Promise = Promise;
mongoose.connect(DB, { useNewUrlParser: true });

export { mongoose, Game };
