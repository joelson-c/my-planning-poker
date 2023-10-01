import { beforeEach, expect, test } from 'vitest';
import HandleConnection from '../../../../../src/services/client-socket/commands/HandleConnection';
import { Mock, mock } from 'ts-jest-mocker';
import SystemUserRepository from '../../../../../src/services/data/SystemUserRepository';
import { Socket } from 'socket.io';

let command: HandleConnection;
let userSocketMock: Mock<Socket>;
let systemUserRepoMock: Mock<SystemUserRepository>;

beforeEach(() => {
    userSocketMock = mock<Socket>();
    systemUserRepoMock = mock<SystemUserRepository>();
    command = new HandleConnection(
        systemUserRepoMock
    );
});

test('sends the user data upon connection', () => {
    const testUserId = '1';
    const testUserData = {
        id: testUserId,
        username: 'abc',
        isObserver: false
    };

    userSocketMock.data.session = {
        userId: testUserId
    };

    systemUserRepoMock.getById.mockImplementation(() => testUserData);

    command.handle({ socket: userSocketMock });

    expect(userSocketMock.emit).toHaveBeenCalledWith('connected', testUserData);
});
