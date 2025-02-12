const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');
const config = require('../../config/config');

const logDirectory = path.join(__dirname, '../../logs'); // Log files location

const dailyRotateTransport = new DailyRotateFile({
    filename: path.join(logDirectory, 'app-%DATE%.log'), // Log file pattern
    datePattern: 'YYYY-MM-DD', // New log file every day
    zippedArchive: true, // Compress old log files
    maxSize: '20m', // Max file size before creating a new file
    maxFiles: '14d', // Keep logs for 14 days
    level: config.env === 'development' ? 'debug' : 'info',
});

const enumerateErrorFormat = winston.format((info) => {
  if (info instanceof Error) {
    Object.assign(info, { message: info.stack });
  }
  return info;
});

const logger = winston.createLogger({
  level: config.env === 'development' ? 'debug' : 'info',
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