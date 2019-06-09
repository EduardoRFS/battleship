import Koa from 'koa';
import config from '../config';
import routes from './routes';
import configRouter from './config';

const env = process.env.NODE_ENV || 'development';
const { PORT } = config[env];

const app = new Koa();

// TODO: IMPORTANT, THINK ABOUT JSON SCHEMA
app.use(configRouter);
app.use(routes);

export default app;

if (!module.parent) {
  app.listen(+process.env.PORT || PORT, () =>
    console.log(`[LOG] Listen on ${PORT}`)
  );
}
