import { beforeEach, expect, test } from 'vitest';
import { Mock, mock } from 'ts-jest-mocker';
import { Socket } from 'socket.io';
import { RoomUser, VotingRoom } from 'my-planit-poker-shared/typings/VotingRoom';

import { testCommand } from './commandFixtures';
import VotingRoomRepository from '../../../../../src/services/data/VotingRoomRepository';
import RoomUserRepository from '../../../../../src/services/data/RoomUserRepository';
import HandleRoomReset from '../../../../../src/services/client-socket/commands/HandleRoomReset';
import CommandUtils from '../../../../../src/services/client-socket/commands/CommandUtils';
import ILogger from '../../../../../src/contracts/ILogger';

let command: HandleRoomReset;
let socketMock: Mock<Socket>;
let roomRepoMock: Mock<VotingRoomRepository>;
let roomUserRepoMock: Mock<RoomUserRepository>;
let commandUtilsMock: Mock<CommandUtils>;

beforeEach(() => {
    socketMock = mock<Socket>();
    roomRepoMock = mock<VotingRoomRepository>();
    roomUserRepoMock = mock<RoomUserRepository>();
    commandUtilsMock = mock<CommandUtils>();
    command = new HandleRoomReset(
        roomRepoMock,
        roomUserRepoMock,
        commandUtilsMock,
        mock<ILogger>()
    );
});

testCommand('does not executes if requesting user is not moderator', () => {
    commandUtilsMock.throwIfUserIsNotModerator.mockImplementation(() => {
        throw new Error('TEST');
    });

    expect(() => {
        command.handle({ socket: socketMock });
    }).toThrowError('TEST');

    expect(commandUtilsMock.getSocketRoom).toHaveBeenCalledTimes(0);
});

testCommand('rests the voting room to its initial state', ({ room, currentRoomUser }) => {
    commandUtilsMock.getSocketRoom.mockImplementation(() => room);
    roomUserRepoMock.getByRoomId.mockImplementation(() => [currentRoomUser]);
    socketMock.to.mockReturnThis();

    socketMock.data.roomId = room.id;

    command.handle({ socket: socketMock });

    expect(roomUserRepoMock.update).toHaveBeenCalledWith({
        ...currentRoomUser,
        hasVoted: false,
        votingValue: undefined
    });

    expect(roomRepoMock.update).toHaveBeenCalledWith({
        ...room,
        hasRevealedCards: false
    });

    expect(socketMock.to).toHaveBeenCalledWith(room.id);
    expect(socketMock.emit).toHaveBeenCalledWith('roomReset');
});
