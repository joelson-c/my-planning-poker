import type Logger from "./services/Logger";
import "reflect-metadata/lite";
import "dotenv/config";
import "./DIRegistry";
import { container } from "tsyringe";
import SocketServer from "./services/SocketServer";
import ClientSocketHandler from "./services/client-socket/ClientSocketHandler";

const socketHandler = container.resolve(SocketServer);
const clientHandler = container.resolve(ClientSocketHandler);
const port = +(process.env.NODE_PORT || 3000);
const logger = container.resolve("ILogger") as Logger;

try {
    socketHandler.initializeServer(port);
    clientHandler.setUpServerEvents(socketHandler.getServer());
} catch (error) {
    logger.error("Unhandled exception has been thrown", { error });
}
