import { beforeEach, expect, test } from 'vitest';
import { Mock, mock } from 'ts-jest-mocker';
import { VotingRoom } from 'my-planit-poker-shared/typings/VotingRoom';

import { testCommand } from './commandFixtures';
import VotingRoomRepository from '../../../../../src/services/data/VotingRoomRepository';
import HandleCreateRoom from '../../../../../src/services/client-socket/commands/HandleCreateRoom';
import ILogger from '../../../../../src/contracts/ILogger';

let command: HandleCreateRoom;
let roomRepoMock: Mock<VotingRoomRepository>;

beforeEach(() => {
    roomRepoMock = mock<VotingRoomRepository>();
    command = new HandleCreateRoom(
        roomRepoMock,
        mock<ILogger>()
    );
});

testCommand('creates a new voting room', ({ room }) => {
    roomRepoMock.create.mockImplementation(() => room.id);
    roomRepoMock.getById.mockImplementation(() => room);

    const result = command.handle();

    expect(roomRepoMock.create).toHaveBeenCalledOnce();
    expect(roomRepoMock.getById).toHaveBeenCalledWith(room.id);
    expect(result).toStrictEqual(room);
});
