import logger from "./logger.js"; // Import your logger

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

    if (!stack) {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = stack;
    }

    // Automatically log the error
    this.logError();
  }

  // Method to log the error using Winston
  logError() {
    const logDetails = {
      message: this.message,
      statusCode: this.statusCode,
      success: this.success,
      errors: this.errors,
      stack: this.cleanStack(this.stack), // Clean the stack trace
      data: this.data,
    };

    // Log the error as 'error' level
    logger.error(JSON.stringify(logDetails, null, 2));
  }

  // Method to clean the stack trace by removing file paths
  cleanStack(stack) {
    if (!stack) return stack;

    // Remove the lines containing file paths by filtering lines with "at"
    const cleanedStack = stack
      .split("\n")
      .filter(line => !line.includes("at file://")) // Exclude lines containing file paths
      .join("\n");

    return cleanedStack;
  }
}
