import { test as setup } from 'tests/fixtures/base';
import { writeFile, mkdir } from 'node:fs/promises';
import { roomData } from './contants';
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
