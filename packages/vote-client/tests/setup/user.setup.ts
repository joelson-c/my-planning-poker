import { test as setup } from 'tests/fixtures/base';
import { LoginRoom } from 'tests/pages/LoginRoom';
import { firstUserAuth, secondUserAuth, observerUserAuth } from './contants';

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
