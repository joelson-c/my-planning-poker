import { test as base } from './faker';
import { readFile } from 'node:fs/promises';
import { roomData } from 'tests/setup/contants';

type WorkerFixtures = {
    roomId: string;
};

export const test = base.extend<object, WorkerFixtures>({
    roomId: [
        // eslint-disable-next-line no-empty-pattern
        async ({}, use) => {
            const fileContents = await readFile(roomData, { encoding: 'utf8' });
            await use(fileContents);
        },
        { scope: 'worker' },
    ],
});
