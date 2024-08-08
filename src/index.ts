import { Server } from 'http';
import app from './app';
import prisma from './client';
import config from './config/config';
import logger from './logs/logger';
import { initializeMsgBusActions } from './external/messageBus';

let server: Server;
let reconnectAttempts = 0;

const initializeServer = async () => {
  await prisma.$connect();
  logger.info('Connected to SQL Database');
  server = app.listen(config.port, () => {
    logger.info(`Listening to port ${config.port}`);
  });

  // Reset reconnect attempts on successful connection
  reconnectAttempts = 0;
};

try {
  initializeServer();
  initializeMsgBusActions();
} catch (error) {
  if (error instanceof Error) {
    logger.error(`Error starting up server: ${error.message}`);
  }

  // Calculate reconnection delay using exponential backoff
  const delay = Math.min(2 ** reconnectAttempts * 1000, 60000); // Maximum delay of 60 seconds

  // Retry connection after the calculated delay
  setTimeout(initializeServer, delay);

  // Increment reconnect attempts
  reconnectAttempts++;
}

const exitHandler = () => {
  if (server) {
    server.close(() => {
      logger.info('Server closed');
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error: unknown) => {
  logger.error(`unexpectedErrorHandler: ${error}`);
  exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', () => {
  logger.info('SIGTERM received');
  if (server) {
    server.close();
  }
});
