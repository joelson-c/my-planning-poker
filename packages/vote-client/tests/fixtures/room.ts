import { test as base } from './faker';
import { CreateRoom } from 'tests/pages/CreateRoom';
import { writeFile, readFile, access, mkdir } from 'node:fs/promises';
import path from 'node:path';
import config from '../../playwright.config';

type WorkerFixtures = {
    roomId: string;
};

export const test = base.extend<object, WorkerFixtures>({
    roomId: [
        async ({ browser, faker }, use) => {
            const id = test.info().parallelIndex;
            const roomDataPath = path.resolve(
                test.info().project.outputDir,
                `.auth/room_${id}.id`,
            );

            let fileExists;
            try {
                await access(roomDataPath);
                fileExists = true;
            } catch {
                fileExists = false;
            }

            if (fileExists) {
                const savedRoomId = await readFile(roomDataPath, {
                    encoding: 'utf8',
                });

                await use(savedRoomId);
                return;
            }

            const page = await browser.newPage({
                storageState: undefined,
                ...config.use,
            });
            const createRoom = new CreateRoom(page);
            await createRoom.goto();
            await createRoom.sendCreateForm(faker.internet.username());
            const roomId = await createRoom.waitForRoom();
            await page.close();

            await mkdir(path.join(roomDataPath, '..'), { recursive: true });
            await writeFile(roomDataPath, roomId);

            await use(roomId);
        },
        { scope: 'worker' },
    ],
});
