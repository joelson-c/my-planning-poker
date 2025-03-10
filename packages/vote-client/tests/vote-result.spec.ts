import type { TestUser } from './fixtures/user';
import { expect, type Browser, type BrowserContext } from '@playwright/test';
import { test } from './fixtures';
import { VoteResult } from './pages/VoteResult';
import { faker } from '@faker-js/faker';
import { JoinRoom } from './pages/JoinRoom';
import { VoteCollect } from './pages/VoteCollect';

const users: TestUser[] = [
    { nickname: faker.internet.username(), vote: '13', observer: false },
    { nickname: faker.internet.username(), vote: '21', observer: false },
    { nickname: faker.internet.username(), vote: '13', observer: false },
    { nickname: faker.internet.username(), vote: '21', observer: false },
    { nickname: faker.internet.username(), observer: true },
    { nickname: faker.internet.username(), observer: true },
];

type UserPage = {
    voteResultPage: VoteResult;
    voteCollectPage: VoteCollect;
    user: TestUser;
    context: BrowserContext;
};

test.use({ testUsers: [users, { scope: 'test' }] });

test.describe('page transitions', () => {
    let userPages: UserPage[] = [];

    test.beforeEach(async ({ testUsers, room, browser }) => {
        await Promise.all(
            testUsers.map(async (user) => {
                const { page, context } = await createRoomContext(
                    browser,
                    room,
                    user,
                );

                userPages.push({
                    voteCollectPage: new VoteCollect(page),
                    voteResultPage: new VoteResult(page),
                    user,
                    context,
                });
            }),
        );
    });

    test.afterEach(async ({}) => {
        await Promise.allSettled(
            userPages.map(async ({ context }) => {
                await context.close();
            }),
        );

        userPages = [];
    });

    test('goes to result page, when the reveal button is clicked', async ({}) => {
        const [firstUser] = userPages;
        await firstUser.voteCollectPage.reveal();

        await Promise.all(
            userPages.map(async ({ voteResultPage }) => {
                await expect(voteResultPage.pageHeader).toBeVisible();
            }),
        );
    });

    test('goes to voting page, when the reset room button is clicked', async ({}) => {
        const [firstUser, secondUser] = userPages;
        await secondUser.voteCollectPage.reveal();
        await firstUser.voteResultPage.reset();

        await Promise.all(
            userPages.map(async ({ voteCollectPage }) => {
                await expect(voteCollectPage.pageHeader).toBeVisible();
            }),
        );
    });
});

test.describe('within vote results', () => {
    let userPages: UserPage[] = [];

    test.beforeEach(async ({ testUsers, room, browser }) => {
        await Promise.all(
            testUsers.map(async (user) => {
                const { page, context } = await createRoomContext(
                    browser,
                    room,
                    user,
                );

                if (user.vote) {
                    const voteCollectPage = new VoteCollect(page);
                    voteCollectPage.vote(user.vote);
                }

                userPages.push({
                    voteCollectPage: new VoteCollect(page),
                    voteResultPage: new VoteResult(page),
                    user,
                    context,
                });
            }),
        );

        const [firstUser] = userPages;
        await firstUser.voteCollectPage.reveal();
    });

    test.afterEach(async ({}) => {
        await Promise.allSettled(
            userPages.map(async ({ context }) => {
                await context.close();
            }),
        );

        userPages = [];
    });

    test('renders with a title after a voting', async ({}) => {
        await Promise.all(
            userPages.map(async ({ voteResultPage }) => {
                await expect(voteResultPage.pageHeader).toBeVisible();
            }),
        );
    });

    test('shows the individual user votes', async ({}) => {
        await Promise.all(
            userPages.map(async ({ voteResultPage, user }) => {
                if (user.vote) {
                    await expect(
                        voteResultPage.getUserVote(user.nickname),
                    ).toHaveText(user.vote);
                    return;
                }

                await expect(
                    voteResultPage.getUserVote(user.nickname),
                ).not.toBeVisible();
            }),
        );
    });

    test('shows the correct summary data', async ({}) => {
        await Promise.all(
            userPages.map(async ({ voteResultPage }) => {
                await expect(voteResultPage.totalVotes).toHaveText('4');
                await expect(voteResultPage.average).toHaveText('17');
                await expect(voteResultPage.median).toHaveText('17');
            }),
        );
    });

    test('shows the correct vote distribution', async ({}) => {
        await Promise.all(
            userPages.map(async ({ voteResultPage }) => {
                await expect(
                    voteResultPage.getDistributionBarForVote('13'),
                ).toHaveAttribute('aria-valuenow', '50');
                await expect(
                    voteResultPage.getDistributionBarForVote('21'),
                ).toHaveAttribute('aria-valuenow', '50');
            }),
        );
    });

    test('does not mutate the result, when a user enters the room', async ({
        page: defaultPage,
        room,
    }) => {
        const joinRoomPage = new JoinRoom(defaultPage);

        await joinRoomPage.goto(room);
        await joinRoomPage.sendJoinForm({
            nickname: 'Extra User',
            observer: false,
        });

        const extraUserResultPage = new VoteResult(defaultPage);

        await expect(extraUserResultPage.pageHeader).toBeVisible();
        await expect(extraUserResultPage.totalVotes).toHaveText('4');

        await Promise.all(
            userPages.map(async ({ voteResultPage }) => {
                await expect(voteResultPage.totalVotes).toHaveText('4');
            }),
        );
    });
});

async function createRoomContext(
    browser: Browser,
    room: string,
    user: TestUser,
    waitForRoom = true,
) {
    const context = await browser.newContext({ storageState: undefined });
    const page = await context.newPage();
    const joinRoomPage = new JoinRoom(page);

    await joinRoomPage.goto(room);
    await joinRoomPage.sendJoinForm({
        nickname: user.nickname,
        observer: user.observer,
    });

    if (waitForRoom) {
        await joinRoomPage.waitForRoom();
    }

    return { page, context };
}
