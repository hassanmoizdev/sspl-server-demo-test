
import { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import AuthenticationError from '../errors/AuthenticationError';
import { ApiError } from '../@core/errors/ApiError';

const apiErrorHandler:ErrorRequestHandler = (err, req, res, next) => {
  console.log(err);
  
  let error = (err as Error).name;
  let message = (err as Error).message;
  let details:{[key:string]: any}|undefined;
  let statusCode = 500;

  /**
   * Handle ApiError (custom application errors).
   */
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        details: err.details
      }
    });
    return;
  }

  /**
   * Handle Validation errors.
   */
  if (err instanceof ZodError) {
    error = 'ValidationError';
    message = 'Validation failed.';
    details = err.format();
    statusCode = 422;
  }

  /**
   * Handle Prisma errors.
   */
  else if (err instanceof Prisma.PrismaClientValidationError) {
    error = 'DatabaseValidationError';
    message = 'Database validation failed.';
    statusCode = 422;
  }
  
  else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    error = 'DatabaseValidationError';
    statusCode = 400;

    switch (err.code) {
      case 'P2002':
        statusCode = 409;
        message = 'Already exists.';
        break;

      case 'P2003':
        message = 'Operation failed because one or more dependent records exist in database.';
        break;

      case 'P2025':
        message = 'One or more id\'s doesnot exist.';
        break;

      default:
        message = 'Unhandled error occured.';
    }
  }
  
  else if (err instanceof Prisma.PrismaClientUnknownRequestError) {
    error = 'DatabaseError';
    message = 'Something went wrong.';
    statusCode = 400;
  }

  /**
   * Handle Authentication errors.
   */
  else if (err instanceof AuthenticationError) {
    statusCode = err.statusCode || 401;
  }

  res.status(statusCode).json({
    error,
    message,
    details
  });
}; 

export default apiErrorHandler;
