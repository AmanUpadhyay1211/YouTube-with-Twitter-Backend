import { createLogger, format, transports } from "winston";
const { combine, timestamp, printf, json, colorize } = format;

// Custom format for error logs
const fileLogFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level}: ${message}`;
});

// Create a Winston logger
const logger = createLogger({
  level: "info", // Default log level
  format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), json()), // Include timestamps in JSON logs
  transports: [
    new transports.Console({
      format: combine(colorize(), timestamp({ format: 'HH:mm:ss' }), printf(({ level, message, timestamp }) => {
        return `${timestamp} ${level}: ${message}`;
      })),
    }),
    new transports.File({
      filename: "app.log",
      format: combine(timestamp(), fileLogFormat), // Log errors to file with custom format
      options: { flags: 'w' }, // To rewrite everytime server starts
    }),
  ],
});

export default logger;
