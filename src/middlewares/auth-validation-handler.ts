
import { RequestHandler } from 'express';
import AuthenticationError from '../errors/AuthenticationError';
import { verifyAccessToken } from '../@core/utils/auth';
import { JwtPayload } from 'jsonwebtoken';
import fs from "fs";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number,
        role: string,
        org_id: number
      }
    }
  }
}

const authValidationHandler:RequestHandler = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    fs.appendFileSync("role_logs.txt", `[AUTH] ${new Date().toISOString()} - Header: ${authHeader ? 'Present' : 'Missing'}\n`);
    
    if (!authHeader)
      throw new Error('Authentication required.');

    const accessToken = authHeader.split(' ')[1];
    if (!accessToken)
      throw new Error('Invalid Authorization header.');

    const payload = verifyAccessToken(accessToken) as JwtPayload;

    req.user = {
      id: parseInt(payload.sub as string),
      role: String(payload.rol),
      org_id: parseInt(payload.aud as string)
    };

    fs.appendFileSync("role_logs.txt", `[AUTH] ${new Date().toISOString()} - User: ${JSON.stringify(req.user)}\n`);

    next();
  }
  catch (err) {
    fs.appendFileSync("role_logs.txt", `[AUTH] ${new Date().toISOString()} - Error: ${(err as Error).message}\n`);
    next(new AuthenticationError((err as Error).message));
  }
};

export default authValidationHandler;
