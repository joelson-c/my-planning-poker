import { beforeEach, expect, test } from 'vitest';
import { Mock, mock } from 'ts-jest-mocker';
import { Socket } from 'socket.io';
import { RoomUser } from 'my-planit-poker-shared/typings/VotingRoom';
import { SocketData } from 'my-planit-poker-shared/typings/ServerTypes';

import { testCommand } from './commandFixtures';
import VotingRoomRepository from '../../../../../src/services/data/VotingRoomRepository';
import RoomUserRepository from '../../../../../src/services/data/RoomUserRepository';
import HandleJoinRoom from '../../../../../src/services/client-socket/commands/HandleJoinRoom';
import ILogger from '../../../../../src/contracts/ILogger';

let command: HandleJoinRoom;
let socketMock: Mock<Socket>;
let roomRepoMock: Mock<VotingRoomRepository>;
let roomUserRepoMock: Mock<RoomUserRepository>;

beforeEach(() => {
    socketMock = mock<Socket>();
    roomRepoMock = mock<VotingRoomRepository>();
    roomUserRepoMock = mock<RoomUserRepository>();
    command = new HandleJoinRoom(
        roomRepoMock,
        roomUserRepoMock,
        mock<ILogger>()
    );
});

testCommand('throws a errow if the specified room does not exists', () => {
    const testRoomId = '1';
    roomRepoMock.getById.mockImplementation(() => undefined);

    expect(() => {
        command.handle({ socket: socketMock, targetRoomId: testRoomId });
    }).toThrowError(`Unable to join in room with ID: ${testRoomId}`);
});

testCommand('joins the user to the specified room and assigns the moderator role to it', ({ room, currentRoomUser }) => {
    const expectedRoomUser: RoomUser = {
        ...currentRoomUser,
        isModerator: true
    }

    roomRepoMock.getById.mockImplementation(() => room);

    roomUserRepoMock.getByRoomId.mockImplementation(() => []);

    socketMock.handshake.auth = {
        username: currentRoomUser.username,
        isObserver: currentRoomUser.isObserver
    }

    socketMock.data.session = {
        userId: currentRoomUser.userId
    }

    const result = command.handle({ socket: socketMock, targetRoomId: room.id });

    expect(roomUserRepoMock.create).toHaveBeenCalledWith(expectedRoomUser);
    expect(result).toStrictEqual(expectedRoomUser);
});

test('does not assigns the moderator role if there are already one user connected', () => {
    const testRoomId = 'room 1';
    const testRoomUsers: RoomUser[] = [
        {
            userId: 'already mod',
            roomId: testRoomId,
            username: 'TEST 1',
            isObserver: false,
            hasVoted: false,
            isModerator: true
        },
        {
            userId: 'new user',
            roomId: testRoomId,
            username: 'TEST 2',
            isObserver: false,
            hasVoted: false,
            isModerator: false
        }
    ];
    const [testModUser, testIncomingUser] = testRoomUsers;

    roomRepoMock.getById.mockImplementation(() => ({
        id: testRoomId,
        hasRevealedCards: false,
    }));

    roomUserRepoMock.getByRoomId.mockImplementation(() => [testModUser]);

    socketMock.handshake.auth = {
        username: testIncomingUser.username,
        isObserver: testIncomingUser.isObserver
    }

    socketMock.data.session = {
        userId: testIncomingUser.userId
    }

    const result = command.handle({ socket: socketMock, targetRoomId: testRoomId });

    expect(roomUserRepoMock.create).toHaveBeenCalledWith(testIncomingUser);
    expect(result).toStrictEqual(testIncomingUser);
});
