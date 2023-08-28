import 'reflect-metadata';
import './src/DIRegistry';

import { container } from 'tsyringe';
import SocketServer from './src/services/SocketServer';
import ClientSocketHandler from './src/services/client-socket/ClientSocketHandler';

const socketHandler = container.resolve(SocketServer);
const clientHandler = container.resolve(ClientSocketHandler);
const port = +(process.env.NODE_PORT || 3000);
socketHandler.initializeServer(port);
clientHandler.setUpServerEvents(socketHandler.getServer());

