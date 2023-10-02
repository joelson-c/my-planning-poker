import { beforeEach, expect, test, vi } from 'vitest';
import { Mock, mock } from 'ts-jest-mocker';
import { Socket } from 'socket.io';
import SystemUserRepository from '../../../../../src/services/data/SystemUserRepository';
import VotingRoomRepository from '../../../../../src/services/data/VotingRoomRepository';
import RoomUserRepository from '../../../../../src/services/data/RoomUserRepository';
import HandleDisconnect from '../../../../../src/services/client-socket/commands/HandleDisconnect';
import ILogger from '../../../../../src/contracts/ILogger';
import { SocketData } from 'my-planit-poker-shared/typings/ServerTypes';
import { RoomUser } from 'my-planit-poker-shared/typings/VotingRoom';

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

test('remove user from room when it disconnects', () => {
    const testRoomUser: RoomUser = {
        userId: testUserId,
        roomId: testRoomId,
        hasVoted: false,
        isModerator: false,
        isObserver: false,
        username: 'TEST'
    };

    vi.stubEnv('DISABLE_EMPTY_ROOM_CLEANUP', 'true');
    vi.stubEnv('NODE_ENV', 'development');

    roomUserRepoMock.getByUserId.mockImplementation(() => testRoomUser);
    roomUserRepoMock.getByRoomId.mockImplementation(() => [testRoomUser]);

    command.handle({ socket: socketMock });

    expect(roomUserRepoMock.deleteByUserId).toHaveBeenCalledWith(testUserId);
    expect(systemUserRepoMock.deleteById).toHaveBeenCalledWith(testUserId);
    expect(roomUserRepoMock.update).toHaveBeenCalledTimes(0);
});

test('deletes the room if there are no more users in it', () => {
    const testRoomUser: RoomUser = {
        userId: testUserId,
        roomId: testRoomId,
        hasVoted: false,
        isModerator: false,
        isObserver: false,
        username: 'TEST'
    };

    roomUserRepoMock.getByUserId.mockImplementation(() => testRoomUser);
    roomUserRepoMock.getByRoomId.mockImplementation(() => []);

    command.handle({ socket: socketMock });

    expect(roomUserRepoMock.deleteByUserId).toHaveBeenCalledWith(testUserId);
    expect(systemUserRepoMock.deleteById).toHaveBeenCalledWith(testUserId);
    expect(roomRepoMock.deleteById).toHaveBeenCalledWith(testRoomId);
});

test('assigns a new moderator when the current one disconnects', () => {
    const testRoomUsers: RoomUser[] = [
        {
            userId: testUserId,
            roomId: testRoomId,
            hasVoted: false,
            isModerator: true,
            isObserver: false,
            username: 'TEST MOD'
        },
        {
            userId: 'user 2',
            roomId: testRoomId,
            hasVoted: false,
            isModerator: false,
            isObserver: false,
            username: 'TEST'
        }
    ];

    roomUserRepoMock.getByUserId.mockImplementation(() => testRoomUsers[0]);
    roomUserRepoMock.getByRoomId.mockImplementation(() => [testRoomUsers[1]]);

    command.handle({ socket: socketMock });

    expect(roomUserRepoMock.deleteByUserId).toHaveBeenCalledWith(testUserId);
    expect(systemUserRepoMock.deleteById).toHaveBeenCalledWith(testUserId);
    expect(roomRepoMock.deleteById).toHaveBeenCalledTimes(0);
    expect(roomUserRepoMock.update).toHaveBeenCalledWith({
        ...testRoomUsers[1],
        isModerator: true
    });
});

