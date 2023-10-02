import { beforeEach, expect, test, vi } from 'vitest';
import { Mock, mock } from 'ts-jest-mocker';
import { Socket } from 'socket.io';
import { RoomUser } from 'my-planit-poker-shared/typings/VotingRoom';
import { SocketData } from 'my-planit-poker-shared/typings/ServerTypes';

import { testCommand } from './commandFixtures';
import VotingRoomRepository from '../../../../../src/services/data/VotingRoomRepository';
import SystemUserRepository from '../../../../../src/services/data/SystemUserRepository';
import RoomUserRepository from '../../../../../src/services/data/RoomUserRepository';
import HandleDisconnect from '../../../../../src/services/client-socket/commands/HandleDisconnect';
import ILogger from '../../../../../src/contracts/ILogger';

let command: HandleDisconnect;
let socketMock: Mock<Socket>;
let systemUserRepoMock: Mock<SystemUserRepository>;
let roomRepoMock: Mock<VotingRoomRepository>;
let roomUserRepoMock: Mock<RoomUserRepository>;

const testUserId = 'user 1';
const testRoomId = 'room 1';

function setupBasicMocks() {
    (socketMock.data as SocketData) = {
        roomId: testRoomId,
        session: {
            id: '1',
            userId: testUserId
        }
    }
}

beforeEach(() => {
    socketMock = mock<Socket>();
    systemUserRepoMock = mock<SystemUserRepository>();
    roomRepoMock = mock<VotingRoomRepository>();
    roomUserRepoMock = mock<RoomUserRepository>();
    command = new HandleDisconnect(
        systemUserRepoMock,
        roomRepoMock,
        roomUserRepoMock,
        mock<ILogger>()
    );

    setupBasicMocks();
});

testCommand('remove user from room when it disconnects', ({ currentRoomUser }) => {
    vi.stubEnv('DISABLE_EMPTY_ROOM_CLEANUP', 'true');
    vi.stubEnv('NODE_ENV', 'development');

    roomUserRepoMock.getByUserId.mockImplementation(() => currentRoomUser);
    roomUserRepoMock.getByRoomId.mockImplementation(() => [currentRoomUser]);

    command.handle({ socket: socketMock });

    expect(roomUserRepoMock.deleteByUserId).toHaveBeenCalledWith(testUserId);
    expect(systemUserRepoMock.deleteById).toHaveBeenCalledWith(testUserId);
    expect(roomUserRepoMock.update).toHaveBeenCalledTimes(0);
});

testCommand('deletes the room if there are no more users in it', ({ currentRoomUser }) => {
    roomUserRepoMock.getByUserId.mockImplementation(() => currentRoomUser);
    roomUserRepoMock.getByRoomId.mockImplementation(() => []);

    command.handle({ socket: socketMock });

    expect(roomUserRepoMock.deleteByUserId).toHaveBeenCalledWith(testUserId);
    expect(systemUserRepoMock.deleteById).toHaveBeenCalledWith(testUserId);
    expect(roomRepoMock.deleteById).toHaveBeenCalledWith(testRoomId);
});

testCommand('assigns a new moderator when the current one disconnects', ({ currentRoomUser, existingRoomUsers }) => {
    currentRoomUser.isModerator = true;

    roomUserRepoMock.getByUserId.mockImplementation(() => currentRoomUser);
    roomUserRepoMock.getByRoomId.mockImplementation(() => [existingRoomUsers[0]]);

    command.handle({ socket: socketMock });

    expect(roomUserRepoMock.deleteByUserId).toHaveBeenCalledWith(testUserId);
    expect(systemUserRepoMock.deleteById).toHaveBeenCalledWith(testUserId);
    expect(roomRepoMock.deleteById).toHaveBeenCalledTimes(0);
    expect(roomUserRepoMock.update).toHaveBeenCalledWith({
        ...existingRoomUsers[0],
        isModerator: true
    });
});

