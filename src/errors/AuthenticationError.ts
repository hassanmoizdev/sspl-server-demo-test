
import HttpError from "./HttpError";

class AuthenticationError extends HttpError {
  constructor (message:string) {
    super(message, 401);
    this.name = 'AuthenticationError';
  }
}

export default AuthenticationError;
