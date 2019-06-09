export default {
  development: {
    DB: 'mongodb://localhost:27017/battleship_test',
    PORT: process.env.PORT,
  },
  test: {
    DB: 'mongodb://localhost:27017/battleship_test',
  },
  production: {
    DB: 'mongodb://localhost:27017/battleship_production',
    PORT: process.env.PORT,
  },
};
