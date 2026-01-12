
class HttpError extends Error {
  statusCode: number;
  details?: Record<string, string>;

  constructor (message:string, statusCode=500, details?:Record<string, string>) {
    super(message);
    this.name = 'HttpError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

export default HttpError;
