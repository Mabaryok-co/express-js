const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');
const config = require('../../config/config');

const logDirectory = path.join(__dirname, '../../logs'); // Log files location

const datePattern = (frequency) => {
  switch (frequency) {
    case "daily":
      return "YYYY-MM-DD";
    case "hourly":
      return "YYYY-MM-DD-HH";
    default:
      return "YYYY-MM-DD";
  }
}

const dailyRotateTransport = new DailyRotateFile({
    filename: `${config.appName}-%DATE%.log`,
    dirname: config.log.directory || logDirectory,
    datePattern: datePattern(config.log.frequency), 
    zippedArchive: config.log.zipped,
    maxSize: `${config.log.maxSize}m`,
    maxFiles: `${config.log.maxAges}d`,
    level: config.log.levels,
});

const enumerateErrorFormat = winston.format((info) => {
  if (info instanceof Error) {
    Object.assign(info, { message: info.stack });
  }
  return info;
});

const logger = winston.createLogger({
  level: config.log.levels,
  format: winston.format.combine(
    enumerateErrorFormat(),
    config.env === 'development' ? winston.format.colorize() : winston.format.uncolorize(),
    winston.format.splat(),
    winston.format.printf(({ level, message }) => `${level}: ${message}`)
  ),
  transports: [
    new winston.transports.Console({
      stderrLevels: ['error'],
    }),
    dailyRotateTransport,
  ],
});

module.exports = logger;