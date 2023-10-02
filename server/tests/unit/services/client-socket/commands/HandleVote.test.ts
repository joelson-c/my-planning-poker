import { beforeEach, expect, test, vi } from 'vitest';
import { Mock, mock } from 'ts-jest-mocker';
import { Socket } from 'socket.io';

import { testCommand } from './commandFixtures';
import RoomUserRepository from '../../../../../src/services/data/RoomUserRepository';
import HandleVote from '../../../../../src/services/client-socket/commands/HandleVote';
import CommandUtils from '../../../../../src/services/client-socket/commands/CommandUtils';
import ILogger from '../../../../../src/contracts/ILogger';

let command: HandleVote;
let socketMock: Mock<Socket>;
let roomUserRepoMock: Mock<RoomUserRepository>;
let commandUtilsMock: Mock<CommandUtils>;

beforeEach(() => {
    socketMock = mock<Socket>();
    roomUserRepoMock = mock<RoomUserRepository>();
    commandUtilsMock = mock<CommandUtils>();
    command = new HandleVote(
        roomUserRepoMock,
        commandUtilsMock,
        mock<ILogger>()
    );
});

testCommand('throws if the user is not found', ({ room }) => {
    const testValue = '8';

    commandUtilsMock.getSocketRoom.mockImplementation(() => room);

    socketMock.data.session = {
        userId: 'TEST'
    }

    expect(() => {
        command.handle({ socket: socketMock, value: testValue, callback: vi.fn(() => {}) });
    }).toThrowError('Invalid User Id')

    expect(roomUserRepoMock.update).toHaveBeenCalledTimes(0);
});

testCommand('computes the user voting value', ({ room, currentRoomUser }) => {
    const testCallback = vi.fn(() => {});
    const testValue = '8';

    commandUtilsMock.getSocketRoom.mockImplementation(() => room);
    roomUserRepoMock.getByUserId.mockImplementation(() => currentRoomUser);

    socketMock.data.session = {
        userId: currentRoomUser.userId
    }

    command.handle({ socket: socketMock, value: testValue, callback: testCallback });

    expect(roomUserRepoMock.update).toHaveBeenCalledWith({
        ...currentRoomUser,
        votingValue: testValue,
        hasVoted: true
    });
    expect(testCallback).toHaveBeenCalledOnce();
});

