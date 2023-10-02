import { beforeEach, expect, Mock as ViMock, test, vi } from 'vitest';
import { Mock, mock } from 'ts-jest-mocker';
import { Socket } from 'socket.io';
import { UserSession } from 'my-planit-poker-shared/typings/UserSession';

import { faker } from '@faker-js/faker';

import RandomIdGenerator from '../../../src/services/RandomIdGenerator';
import SystemUserRepository from '../../../src/services/data/SystemUserRepository';
import SessionMiddleware from '../../../src/middlewares/SessionMiddleware';
import ISessionStorage from '../../../src/contracts/ISessionStorage';

let command: SessionMiddleware;
let socketMock: Mock<Socket>;
let sessionStorageMock: Mock<ISessionStorage>;
let systemUserRepoMock: Mock<SystemUserRepository>;
let randomIdGeneratorMock: Mock<RandomIdGenerator>;
let nextFunctionMock: ViMock<[], void>;

beforeEach(() => {
    socketMock = mock<Socket>();
    sessionStorageMock = mock<ISessionStorage>();
    systemUserRepoMock = mock<SystemUserRepository>();
    randomIdGeneratorMock = mock<RandomIdGenerator>();
    nextFunctionMock = vi.fn(() => {});
    command = new SessionMiddleware(
        sessionStorageMock,
        systemUserRepoMock,
        randomIdGeneratorMock
    );
});

test('returns a existing session for a user', () => {
    const testSessionId = faker.string.uuid();
    const testSession: UserSession = {
        id: testSessionId,
        userId: faker.string.alphanumeric(5)
    }

    socketMock.handshake.auth = {
        sessionId: testSessionId
    };

    sessionStorageMock.getById.mockImplementation(() => testSession);

    command.execute(socketMock, nextFunctionMock);

    expect(socketMock.data.session).toStrictEqual(testSession);
    expect(nextFunctionMock).toHaveBeenCalledOnce();
});

test('opens a new session for unknown user', () => {
    const expectedSession: UserSession = {
        id: faker.string.uuid(),
        userId: faker.string.alphanumeric(5)
    }

    const testAuthParams = {
        sessionId: undefined,
        username: faker.internet.displayName(),
        isObserver: true
    };

    socketMock.handshake.auth = testAuthParams;

    randomIdGeneratorMock.generateRandomId.mockImplementation(() => expectedSession.id);
    systemUserRepoMock.create.mockImplementation(() => expectedSession.userId);

    command.execute(socketMock, nextFunctionMock);

    expect(socketMock.data.session).toStrictEqual(expectedSession);
    expect(systemUserRepoMock.create).toHaveBeenCalledWith({
        username: testAuthParams.username,
        isObserver: testAuthParams.isObserver
    });
    expect(sessionStorageMock.save).toHaveBeenCalledWith(expectedSession);
    expect(nextFunctionMock).toHaveBeenCalledOnce();
});
