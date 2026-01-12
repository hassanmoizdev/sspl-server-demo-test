import { RequestHandler } from 'express';
import AuthenticationError from '../errors/AuthenticationError';
import fs from "fs";

/**
 * Middleware factory that validates if the authenticated user has one of the allowed roles
 * @param allowedRoles - Array of roles that are allowed to access the route
 * @returns Express middleware function
 */
export const roleValidationHandler = (allowedRoles: string[]): RequestHandler => {
  return (req, res, next) => {
    try {
      fs.appendFileSync("role_logs.txt", `[ROLE] ${new Date().toISOString()} - Checking roles: ${allowedRoles.join(', ')}\n`);
      
      // Check if user exists on request (should be set by authValidationHandler)
      if (!req.user) {
        fs.appendFileSync("role_logs.txt", `[ROLE] ${new Date().toISOString()} - No user found on request\n`);
        throw new Error('Authentication required.');
      }

      fs.appendFileSync("role_logs.txt", `[ROLE] ${new Date().toISOString()} - User role: ${req.user.role}\n`);

      // Check if user's role is in the allowed roles
      if (!allowedRoles.includes(req.user.role)) {
        fs.appendFileSync("role_logs.txt", `[ROLE] ${new Date().toISOString()} - Role ${req.user.role} not in allowed roles\n`);
        throw new Error(`Access denied. Required roles: ${allowedRoles.join(', ')}`);
      }

      fs.appendFileSync("role_logs.txt", `[ROLE] ${new Date().toISOString()} - Role validation passed\n`);
      next();
    } catch (err) {
      fs.appendFileSync("role_logs.txt", `[ROLE] ${new Date().toISOString()} - Error: ${(err as Error).message}\n`);
      next(new AuthenticationError((err as Error).message));
    }
  };
};
