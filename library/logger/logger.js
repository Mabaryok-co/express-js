const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');
const { config } = require('../../config/config');

const logDirectory = path.join(__dirname, '../../logs'); // Log files location
const logPath = config.log.directory || logDirectory;

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

const logCaller = winston.format((info) => {
  // Capture the stack trace
  const stack = new Error().stack;

  // Extract the relevant stack line (skipping current function and Winston internals)
  const stackLines = stack.split('\n');
  const callerLine = stackLines[10]; // Line 3 in the stack trace is usually the caller

  // Extract file path and format it
  const match = callerLine.match(/\(([^)]+)\)/); // Matches '(file.js:line:column)'
  if (match && match[1]) {
    const filePath = match[1];
    info.caller = path.basename(filePath); // Add caller file name to log metadata
  } else {
    info.caller = 'unknown';
  }
  return info;
});

const enumerateErrorFormat = winston.format((info) => {
  if (info instanceof Error) {
    Object.assign(info, { message: info.stack });
  }
  return info;
});

const dailyRotateTransport = new DailyRotateFile({
  filename: `${config.appName}-%DATE%.log`,
  dirname: logPath,
  datePattern: datePattern(config.log.frequency),
  zippedArchive: config.log.zipped,
  maxSize: `${config.log.maxSize}m`,
  maxFiles: `${config.log.maxAges}d`,
  level: config.log.levels,
  format: winston.format.combine(
    logCaller(),
    enumerateErrorFormat(),
    winston.format.uncolorize(),
    winston.format.splat(),
    winston.format.printf(({ timestamp ,level, caller, message }) => `[${timestamp}] [${caller}] ${level.toUpperCase()} ${message}`)
  ),
});

const logger = winston.createLogger({
  level: config.log.levels,
  format: winston.format.combine(
    logCaller(),
    enumerateErrorFormat(),
    winston.format.colorize(),
    winston.format.splat(),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ timestamp ,level, caller, message }) => `[${timestamp}] [${caller}] ${level} ${message}`)
  ),
  transports: [
    new winston.transports.Console({
      stderrLevels: ['error'],
    }),
    dailyRotateTransport,
  ],
});

module.exports = logger;