
import path from 'path';
import Express from 'express';
import bodyParser from 'body-parser';
import Cors from 'cors';
import routes from './routes';

const app = Express();
app.use(Cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(Express.json());
app.use('/uploads', Express.static('uploads'));
app.use(routes);

export default app;