import mongoose from 'mongoose';

// TODO: validate if is integer
const positionSchema = mongoose.Schema(
  { x: Number, y: Number },
  { _id: false }
);
const unitSchema = mongoose.Schema(
  {
    position: positionSchema,
    rotation: {
      type: String,
      enum: ['horizontal', 'vertical'],
    },
  },
  { _id: false }
);
export default mongoose.Schema(
  {
    public_key: String,
    name: String,
    placed: { type: Boolean, default: false },
    // TODO: perhaps we can allow dynamic units
    positions: {
      aircraft_carrier: unitSchema,
      battleship: unitSchema,
      submarine: unitSchema,
      destroyer: unitSchema,
      boat: unitSchema,
    },
    attacks: [
      {
        position: positionSchema,
        // TODO: think better, it is the position in array
        player: Number,
        hit: Boolean,
      },
    ],
  },
  { _id: false }
);
