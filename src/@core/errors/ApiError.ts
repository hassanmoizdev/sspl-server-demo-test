export class ApiError extends Error {
  public statusCode: number;
  public code: string;
  public details: any;

  constructor(statusCode: number, code: string, message: string, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details || {};
    
    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }
}

// Common error factory functions
export const SessionNotFoundError = () => 
  new ApiError(404, "SESSION_NOT_FOUND", "Session with the given join code doesn't exist");

export const SessionExpiredError = () => 
  new ApiError(410, "SESSION_EXPIRED", "Session has expired");

export const DuplicateAnswerError = () => 
  new ApiError(409, "DUPLICATE_ANSWER", "Answer already submitted for this question");

export const InvalidParticipantError = () => 
  new ApiError(400, "INVALID_PARTICIPANT", "Participant ID not found or doesn't belong to session");

export const InvalidQuestionError = () => 
  new ApiError(400, "INVALID_QUESTION", "Question ID not found or doesn't belong to scenario");

export const InvalidOptionError = () => 
  new ApiError(400, "INVALID_OPTION", "Option ID not found or doesn't belong to question");

export const ValidationError = (message: string, details?: any) => 
  new ApiError(400, "VALIDATION_ERROR", message, details);
