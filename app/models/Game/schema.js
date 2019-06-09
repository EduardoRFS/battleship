import _ from 'lodash/fp';
import mongoose from 'mongoose';
import playerSchema from './playerSchema';

// TODO: allow choosing the slug at creation
const schema = mongoose.Schema(
  {
    owner: { type: { public_key: String }, required: true },
    // TODO: validate int and bigger or equal to 2
    max_players: { type: Number, required: true },
    players: { type: [playerSchema], default: [], required: true },
    state: {
      type: String,
      enum: ['joining', 'placing', 'battle'],
      default: 'joining',
      required: true,
    },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  }
);
schema.set('toJSON', {
  virtuals: true,
});
const findPlayer = publicKey => _.find(['public_key', publicKey]);
schema.methods.findPlayerByKey = function findPlayerByKey(key) {
  return findPlayer(key)(this.players);
};

schema.pre('save', function updateState(next) {
  if (this.players.length === this.max_players) {
    this.state = 'placing';
    if (_.every('placed', this.players)) {
      this.state = 'battle';
    }
  }
  next();
});
export default schema;
