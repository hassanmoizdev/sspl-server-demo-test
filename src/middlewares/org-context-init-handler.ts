
import { RequestHandler } from 'express';
import { setContext } from '../@core/utils/async-context';

const orgContextInitHandler:RequestHandler = (req, res, next) => {
  return setContext('org', req.app.get('org'))(() => next());
};

export default orgContextInitHandler;
