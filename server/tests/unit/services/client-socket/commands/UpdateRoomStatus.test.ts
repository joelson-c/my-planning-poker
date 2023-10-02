import { beforeEach, expect, test } from 'vitest';
import { Mock, mock } from 'ts-jest-mocker';
import { Socket } from 'socket.io';

import { testCommand } from './commandFixtures';
import VotingRoomRepository from '../../../../../src/services/data/VotingRoomRepository';
import HandleCardReveal from '../../../../../src/services/client-socket/commands/HandleCardReveal';
import CommandUtils from '../../../../../src/services/client-socket/commands/CommandUtils';
import ILogger from '../../../../../src/contracts/ILogger';

let command: HandleCardReveal;
let socketMock: Mock<Socket>;
let roomRepoMock: Mock<VotingRoomRepository>;
let commandUtilsMock: Mock<CommandUtils>;

beforeEach(() => {
    socketMock = mock<Socket>();
    roomRepoMock = mock<VotingRoomRepository>();
    commandUtilsMock = mock<CommandUtils>();
    command = new HandleCardReveal(
        roomRepoMock,
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

testCommand('update the room status with "hasRevealedCards" flag', ({ room }) => {
    commandUtilsMock.getSocketRoom.mockImplementation(() => room);

    command.handle({ socket: socketMock });

    expect(roomRepoMock.update).toHaveBeenCalledWith({
        ...room,
        hasRevealedCards: true
    });
});
