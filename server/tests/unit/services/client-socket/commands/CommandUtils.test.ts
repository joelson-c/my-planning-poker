import { beforeEach, describe, expect, test } from 'vitest';
import { Mock, mock } from 'ts-jest-mocker';
import { Socket } from 'socket.io';

import { ro } from '@faker-js/faker';

import { testCommand } from './commandFixtures';
import VotingRoomRepository from '../../../../../src/services/data/VotingRoomRepository';
import RoomUserRepository from '../../../../../src/services/data/RoomUserRepository';
import CommandUtils from '../../../../../src/services/client-socket/commands/CommandUtils';
import UnauthorizedAccess from '../../../../../src/errors/UnauthorizedAccess';
import ILogger from '../../../../../src/contracts/ILogger';

let utils: CommandUtils;
let socketMock: Mock<Socket>;
let roomRepoMock: Mock<VotingRoomRepository>;
let roomUserRepoMock: Mock<RoomUserRepository>;

beforeEach(() => {
    socketMock = mock<Socket>();
    roomRepoMock = mock<VotingRoomRepository>();
    roomUserRepoMock = mock<RoomUserRepository>();
    utils = new CommandUtils(
        roomRepoMock,
        roomUserRepoMock,
        mock<ILogger>()
    );
});

describe('getSocketRoom', () => {
    testCommand('throws if there is not a room assigned to the socket', () => {
        expect(() => {
            utils.getSocketRoom(socketMock);
        }).toThrowError('Missing Room Id');
    });

    testCommand('throws if the room is not found', ({ room }) => {
        socketMock.data.roomId = room.id + 'NOT-FOUND-ID';

        expect(() => {
            utils.getSocketRoom(socketMock);
        }).toThrowError('Voting room not found');
    });

    testCommand('gets the room assigned to a socket (user)', ({ room }) => {
        socketMock.data.roomId = room.id;

        roomRepoMock.getById.mockImplementation(() => room);

        const result = utils.getSocketRoom(socketMock);

        expect(result).toStrictEqual(room);
    });
});

describe('throwIfUserIsNotModerator', () => {
    testCommand('throws if the user is not a moderator or is missing', () => {
        socketMock.data.session = {
            userId: 'TEST'
        };

        expect(() => {
            utils.throwIfUserIsNotModerator(socketMock);
        }).toThrowError(new UnauthorizedAccess());
    });
});

