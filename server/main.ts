import 'reflect-metadata';
import 'dotenv/config';
import './src/DIRegistry';

import { container } from 'tsyringe';
import SocketServer from './src/services/SocketServer';
import ClientSocketHandler from './src/services/client-socket/ClientSocketHandler';
import Logger from './src/services/Logger';

const socketHandler = container.resolve(SocketServer);
const clientHandler = container.resolve(ClientSocketHandler);
const port = +(process.env.NODE_PORT || 3000);
const logger = container.resolve('ILogger') as Logger;

try {
    socketHandler.initializeServer(port);
    clientHandler.setUpServerEvents(socketHandler.getServer());
} catch (error) {
    logger.error('Unhandled exception has been thrown', { error });
}
