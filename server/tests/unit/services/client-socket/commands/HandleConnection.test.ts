import { beforeEach, expect, test } from 'vitest';
import { Mock, mock } from 'ts-jest-mocker';
import { Socket } from 'socket.io';
import { SocketData } from 'my-planit-poker-shared/typings/ServerTypes';

import { testCommand } from './commandFixtures';
import SystemUserRepository from '../../../../../src/services/data/SystemUserRepository';
import HandleConnection from '../../../../../src/services/client-socket/commands/HandleConnection';

let command: HandleConnection;
let socketMock: Mock<Socket>;
let systemUserRepoMock: Mock<SystemUserRepository>;

beforeEach(() => {
    socketMock = mock<Socket>();
    systemUserRepoMock = mock<SystemUserRepository>();
    command = new HandleConnection(
        systemUserRepoMock
    );
});

testCommand('sends the user data upon connection', ({ systemUser }) => {
    const testUserId = '1';

    (socketMock.data as SocketData).session = {
        id: '1',
        userId: testUserId
    };

    systemUserRepoMock.getById.mockImplementation(() => systemUser);

    command.handle({ socket: socketMock });

    expect(socketMock.emit).toHaveBeenCalledWith('connected', systemUser);
});
