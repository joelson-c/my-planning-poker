import { beforeEach, expect } from 'vitest';
import { Mock, mock } from 'ts-jest-mocker';
import { Socket } from 'socket.io';
import { RoomStatusEvent } from 'my-planit-poker-shared/typings/VotingRoom';

import { testCommand } from './commandFixtures';
import VotingRoomRepository from '../../../../../src/services/data/VotingRoomRepository';
import SystemUserRepository from '../../../../../src/services/data/SystemUserRepository';
import RoomUserRepository from '../../../../../src/services/data/RoomUserRepository';
import UpdateRoomStatus from '../../../../../src/services/client-socket/commands/UpdateRoomStatus';
import ILogger from '../../../../../src/contracts/ILogger';

let command: UpdateRoomStatus;
let socketMock: Mock<Socket>;
let roomRepoMock: Mock<VotingRoomRepository>;
let systemUserRepoMock: Mock<SystemUserRepository>;
let roomUserRepoMock: Mock<RoomUserRepository>;

beforeEach(() => {
    socketMock = mock<Socket>();
    roomRepoMock = mock<VotingRoomRepository>();
    systemUserRepoMock = mock<SystemUserRepository>();
    roomUserRepoMock = mock<RoomUserRepository>();
    command = new UpdateRoomStatus(
        roomRepoMock,
        systemUserRepoMock,
        roomUserRepoMock,
        mock<ILogger>()
    );
});

testCommand('send updated room data', ({ room, currentRoomUser, systemUser }) => {
    const expectedResult: RoomStatusEvent = {
        room,
        users: [currentRoomUser]
    }

    socketMock.data.roomId = room.id;

    roomRepoMock.getById.mockImplementation(() => room);
    roomUserRepoMock.getByRoomId.mockImplementation(() => [currentRoomUser]);
    systemUserRepoMock.getById.mockImplementation(() => systemUser);
    socketMock.to.mockReturnThis();

    command.handle({ socket: socketMock });

    expect(roomRepoMock.getById).toHaveBeenCalledWith(room.id);
    expect(roomUserRepoMock.getByRoomId).toHaveBeenCalledWith(room.id);
    expect(systemUserRepoMock.getById).toHaveBeenCalledWith(currentRoomUser.userId);
    expect(socketMock.to).toHaveBeenCalledWith(room.id);
    expect(socketMock.emit).toHaveBeenCalledTimes(2);
    expect(socketMock.emit).toHaveBeenCalledWith('roomStatus', expectedResult);
});
