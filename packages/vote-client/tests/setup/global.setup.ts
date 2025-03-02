import { test as setup } from 'tests/fixtures/base';
import { writeFile, mkdir } from 'node:fs/promises';
import { LoginRoom } from 'tests/pages/LoginRoom';
import {
    roomData,
    firstUserAuth,
    secondUserAuth,
    observerUserAuth,
} from './contants';
import { CreateRoom } from 'tests/pages/CreateRoom';
import path from 'node:path';

setup('setup room', async ({ page, faker }) => {
    const createRoom = new CreateRoom(page);
    await createRoom.goto();
    await createRoom.sendCreateForm(faker.internet.username());
    const roomId = await createRoom.waitForRoom();

    await mkdir(path.join(roomData, '..'), { recursive: true });
    await writeFile(roomData, roomId);
});

[
    { user: 'first', path: firstUserAuth },
    { user: 'second', path: secondUserAuth },
    { user: 'observer', path: observerUserAuth, observer: true },
].forEach(({ user, path, observer }) => {
    setup(`setup ${user} user`, async ({ page, context, roomId, faker }) => {
        const loginRoom = new LoginRoom(page);
        await loginRoom.goto();
        await loginRoom.sendJoinForm(
            faker.internet.username(),
            roomId,
            observer,
        );
        await loginRoom.waitForRoom();

        await context.storageState({ path });
    });
});
