import {
    firstUserAuth,
    secondUserAuth,
    observerUserAuth,
} from 'tests/setup/contants';
import { test as base } from './base';
import { VoteCollect } from 'tests/pages/VoteCollect';

type TestFixtures = {
    firstUser: VoteCollect;
    secondUser: VoteCollect;
    observerUser: VoteCollect;
};

export const test = base.extend<TestFixtures>({
    firstUser: async ({ browser, roomId }, use) => {
        const context = await browser.newContext({
            storageState: firstUserAuth,
        });
        const firstUser = new VoteCollect(await context.newPage(), roomId);
        // eslint-disable-next-line react-hooks/rules-of-hooks
        await use(firstUser);
        await context.close();
    },
    secondUser: async ({ browser, roomId }, use) => {
        const context = await browser.newContext({
            storageState: secondUserAuth,
        });
        const secondUser = new VoteCollect(await context.newPage(), roomId);
        // eslint-disable-next-line react-hooks/rules-of-hooks
        await use(secondUser);
        await context.close();
    },
    observerUser: async ({ browser, roomId }, use) => {
        const context = await browser.newContext({
            storageState: observerUserAuth,
        });
        const observerUser = new VoteCollect(await context.newPage(), roomId);
        // eslint-disable-next-line react-hooks/rules-of-hooks
        await use(observerUser);
        await context.close();
    },
});
