require('module-alias/register')
const app = require('./src/app');
const {config} = require('@config');
const logger = require('@logger');

const exitHandler = () => {
  if (process.server) {
    process.server.close(() => {
      logger.info('Server closed');
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error) => {
  logger.error(error);
  exitHandler();
};

function main() {
  process.server = app.listen(config.port, () => {
    logger.info(`Listening to port ${config.port}`);
  });
}

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', () => {
  logger.info('SIGTERM received');
  if (process.server) {
    process.server.close();
  }
});

main();