import { createLogger, format, transports } from "winston";
const { combine, timestamp, printf, json, colorize } = format;

// Custom timestamp format
const customTimestampFormat = format.timestamp({
  format: 'HH:mm:ss', // Use 'HH:mm:ss' for 24-hour format
});

// Custom format for console logging with colors
const consoleLogFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level}: ${message}`;
});

// Custom format for file logging
const fileLogFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level}: ${message}`;
});

// Create a Winston logger
const logger = createLogger({
  level: "info",
  format: combine(customTimestampFormat, json()), // Using the custom timestamp format for JSON logs
  transports: [
    new transports.Console({
      format: combine(colorize(), customTimestampFormat, consoleLogFormat),
    }),
    new transports.File({
      filename: "app.log",
      format: combine(customTimestampFormat, fileLogFormat), // Using the custom timestamp format for file logs
    }),
  ],
});

export default logger;
