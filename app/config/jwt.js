import jwt from 'jsonwebtoken';

const options = { algorithms: ['RS256'] };
// TODO: perhaps allows to custom algorithm
export default (ctx, next) => {
  ctx.jwt = {
    decode: token => jwt.decode(token, options),
    validate: (token, publicKey) => jwt.verify(token, publicKey, options),
    selfValidate(token) {
      const { public_key: publicKey } = jwt.decode(token);
      return jwt.verify(token, publicKey, options);
    },
  };
  return next();
};
