export class ApiError extends Error {
  constructor(
    statusCode = 500,
    message = "Something went wrong",
    errors = [],
    data = null,
    stack = ""
  ) {
    super(message);
    this.success = false;
    this.message = message;
    this.statusCode = statusCode;
    this.errors = errors;
    this.data = data;
  
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
