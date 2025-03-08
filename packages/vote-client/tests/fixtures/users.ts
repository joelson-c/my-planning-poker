import type { Browser } from '@playwright/test';
import type { Faker } from '@faker-js/faker';
import { test as base } from './room';
import { VoteCollect } from 'tests/pages/VoteCollect';
import { getCardsForVariant } from '~/lib/voteCards';
import { LoginRoom } from 'tests/pages/LoginRoom';
import { access, unlink } from 'node:fs/promises';
import path from 'node:path';
import config from '../../playwright.config';

type WorkerFixtures = {
    firstUser: VoteCollect;
    secondUser: VoteCollect;
    observerUser: VoteCollect;
    allUsers: VoteCollect[];
    votingUsers: VoteCollect[];
    userVotes: WeakMap<VoteCollect, string>;
};

interface SetupUserArgs {
    nickname: string;
    browser: Browser;
    roomId: string;
    faker: Faker;
    observer?: boolean;
}

async function setupUser({
    browser,
    nickname,
    roomId,
    observer,
}: SetupUserArgs): Promise<string> {
    const id = test.info().parallelIndex;
    const userDataPath = path.resolve(
        test.info().project.outputDir,
        `.auth/user_${nickname}_${roomId}_${id}.json`,
    );

    try {
        await access(userDataPath);
        return userDataPath;
    } catch {
        // DO NOTHING
    }

    const page = await browser.newPage({
        storageState: undefined,
        ...config.use,
    });
    const loginRoom = new LoginRoom(page);
    await loginRoom.goto();
    await loginRoom.sendJoinForm(nickname, roomId, observer);
    await loginRoom.waitForRoom();

    await page.context().storageState({ path: userDataPath });
    await page.close();

    return userDataPath;
}

export const test = base.extend<object, WorkerFixtures>({
    firstUser: [
        async ({ browser, roomId, faker }, use) => {
            const storageState = await setupUser({
                browser,
                nickname: faker.internet.username(),
                roomId,
                faker,
            });

            const context = await browser.newContext({
                storageState,
            });

            const user = new VoteCollect(await context.newPage(), roomId);
            await use(user);
            await context.close();

            await unlink(storageState);
        },
        { scope: 'worker' },
    ],
    secondUser: [
        async ({ browser, roomId, faker }, use) => {
            const storageState = await setupUser({
                browser,
                nickname: faker.internet.username(),
                roomId,
                faker,
            });

            const context = await browser.newContext({
                storageState,
            });

            const user = new VoteCollect(await context.newPage(), roomId);
            await use(user);
            await context.close();
            await unlink(storageState);
        },
        { scope: 'worker' },
    ],
    observerUser: [
        async ({ browser, roomId, faker }, use) => {
            const storageState = await setupUser({
                browser,
                nickname: faker.internet.username(),
                roomId,
                faker,
                observer: true,
            });

            const context = await browser.newContext({
                storageState,
            });

            const user = new VoteCollect(await context.newPage(), roomId);
            await use(user);
            await context.close();
            await unlink(storageState);
        },
        { scope: 'worker' },
    ],
    allUsers: [
        async ({ firstUser, secondUser, observerUser }, use) => {
            await use([firstUser, secondUser, observerUser]);
        },
        { scope: 'worker' },
    ],
    votingUsers: [
        async ({ firstUser, secondUser }, use) => {
            await use([firstUser, secondUser]);
        },
        { scope: 'worker' },
    ],
    userVotes: [
        async ({ firstUser, secondUser, faker }, use) => {
            const users = [firstUser, secondUser];
            const usersVotes = users.reduce((acc, user) => {
                const voteValue = faker.helpers.arrayElement(
                    getCardsForVariant('FIBONACCI'),
                );

                acc.set(user, voteValue);
                return acc;
            }, new WeakMap() as WeakMap<VoteCollect, string>);

            await use(usersVotes);
        },
        { scope: 'worker' },
    ],
});
