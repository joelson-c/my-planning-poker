/* eslint-disable react-hooks/rules-of-hooks */
import { test as base } from './base';
import { CreateRoom } from 'tests/pages/CreateRoom';
import { LoginRoom } from 'tests/pages/LoginRoom';

type TestFixtures = {
    createRoom: CreateRoom;
    loginRoom: LoginRoom;
};

export const test = base.extend<TestFixtures>({
    createRoom: async ({ page }, use) => {
        await use(new CreateRoom(page));
    },
    loginRoom: async ({ page }, use) => {
        await use(new LoginRoom(page));
    },
});
