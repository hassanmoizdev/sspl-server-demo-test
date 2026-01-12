
import { RequestHandler } from 'express';
import { setContext } from '../@core/utils/async-context';

const authContextInitHandler:RequestHandler = (req, res, next) => {
  return setContext('auth', {user: req.user})(() => next());
};

export default authContextInitHandler;
