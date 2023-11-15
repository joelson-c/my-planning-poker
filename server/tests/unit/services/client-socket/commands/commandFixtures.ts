import { test } from 'vitest';
import { RoomUser, VotingRoom } from 'my-planit-poker-shared/typings/VotingRoom';
import { SystemUser } from 'my-planit-poker-shared/typings/SystemUser';

import { faker } from '@faker-js/faker';

interface CommandFixtures {
    room: VotingRoom;
    currentRoomUser: RoomUser;
    existingRoomUsers: RoomUser[];
    systemUser: SystemUser;
}

const testRoomId = faker.string.alphanumeric(5);
const testSystemUser: SystemUser = {
    id: faker.string.alphanumeric(5),
    isObserver: false,
    username: faker.internet.displayName()
};

export const testCommand = test.extend<CommandFixtures>({
    room: {
        id: testRoomId,
        hasRevealedCards: false
    },
    currentRoomUser: {
        userId: testSystemUser.id,
        roomId: testRoomId,
        hasVoted: false,
        isModerator: false,
        isObserver: testSystemUser.isObserver,
        username: testSystemUser.username
    },
    systemUser: testSystemUser,
    existingRoomUsers: Array.from(Array(2)).map(() => ({
        userId: faker.string.alphanumeric(5),
        roomId: testRoomId,
        hasVoted: false,
        isModerator: false,
        isObserver: false,
        username: faker.internet.displayName()
    })),
});
