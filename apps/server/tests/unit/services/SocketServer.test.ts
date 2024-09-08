import type { Server } from "my-planit-poker";
import { Socket } from "socket.io";
import { afterEach, beforeEach, test, vi, expect } from "vitest";
import { mock, Mock } from "ts-jest-mocker";
import SocketServer from "../../../src/services/SocketServer";
import IMiddleware from "../../../src/contracts/IMiddleware";
import ILogger from "../../../src/contracts/ILogger";
import ServerFactory from "../../../src/factories/ServerFactory";

let server: SocketServer;
let serverMock: Mock<Server>;
let middlewareMock: Mock<IMiddleware>;

beforeEach(() => {
    const serverFactory = mock<ServerFactory>();
    serverMock = mock<Server>();
    serverFactory.build.mockImplementation(() => serverMock);

    serverMock.use.mockImplementation((fnArg) => {
        fnArg(mock<Socket>(), vi.fn());
        return serverMock;
    });

    middlewareMock = mock<IMiddleware>();
    server = new SocketServer([middlewareMock], serverFactory, mock<ILogger>());
});

afterEach(() => {
    vi.restoreAllMocks();
});

test("initializes the server", () => {
    const testPort = 1;

    server.initializeServer(testPort);

    expect(serverMock.use).toHaveBeenCalled();
    expect(middlewareMock.execute).toHaveBeenCalled();
    expect(serverMock.listen).toHaveBeenCalledWith(testPort);
});
