import { test as base } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { CreateRoom } from 'tests/pages/CreateRoom';
import { JoinRoom } from 'tests/pages/JoinRoom';
import { VoteCollect } from 'tests/pages/VoteCollect';

type Fixtures = {
    createRoomPage: CreateRoom;
    joinRoomPage: JoinRoom;
    voteCollectPage: VoteCollect;
    room: string;
};

export const test = base.extend<Fixtures>({
    createRoomPage: async ({ page }, use) => {
        await use(new CreateRoom(page));
    },
    joinRoomPage: async ({ page }, use) => {
        await use(new JoinRoom(page));
    },
    voteCollectPage: async ({ page }, use) => {
        await use(new VoteCollect(page));
    },
    room: async ({ createRoomPage }, use) => {
        await createRoomPage.goto();
        await createRoomPage.sendCreateForm(faker.internet.username());
        const roomId = await createRoomPage.waitForRoom();
        await use(roomId);
    },
});
