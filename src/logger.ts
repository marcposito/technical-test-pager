import * as winston from "winston";

const { LOG_LEVEL = "info", SILENT = false } = process.env;

const logger: winston.Logger = winston.createLogger({
  transports: [
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
  level: LOG_LEVEL,
  exitOnError: false,
  silent: SILENT === "true", // convert string true to bool
});

export default logger;
