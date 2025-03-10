import type { TestUser } from './fixtures/user';
import { VoteCollect } from './pages/VoteCollect';
import { expect, type BrowserContext } from '@playwright/test';
import { test } from './fixtures';
import { faker } from '@faker-js/faker';
import { JoinRoom } from './pages/JoinRoom';

test.describe('single user voting', () => {
    const users: TestUser[] = [
        { nickname: faker.internet.username(), vote: '13', observer: false },
    ];

    test.use({ testUsers: [users, { scope: 'test' }] });

    test.beforeEach(async ({ testUsers: [user], joinRoomPage, room }) => {
        await joinRoomPage.goto(room);
        await joinRoomPage.sendJoinForm({ nickname: user.nickname });
        await joinRoomPage.waitForRoom();
    });

    test('renders with a title', async ({ voteCollectPage }) => {
        await expect(voteCollectPage.pageHeader).toBeVisible();
    });

    test('renders with the user in list', async ({
        voteCollectPage,
        testUsers: [user],
    }) => {
        await expect(
            voteCollectPage.getUserListItem(user.nickname),
        ).toBeVisible();
    });

    test('allows the user to cast a vote', async ({
        voteCollectPage,
        testUsers: [user],
    }) => {
        await voteCollectPage.vote('13');

        const expectedVoteBtn = voteCollectPage.getVoteButton(user.vote!);
        const checkedBtn = voteCollectPage.getCurrentVoteSwitch();
        await expect(expectedVoteBtn).toBeChecked();
        await expect(checkedBtn).toHaveCount(1);
    });

    test('changes the status indicator when the user votes', async ({
        voteCollectPage,
        testUsers: [user],
    }) => {
        await voteCollectPage.vote('13');

        await expect(
            voteCollectPage.getUserListItem(user.nickname),
        ).toBeVisible();
        await expect(
            voteCollectPage.getUserStatus(user.nickname),
        ).toHaveAccessibleName('Voted');
    });

    test('copies the room share URL to the clipboard', async ({
        voteCollectPage,
        room,
    }) => {
        const sharedUrl = await voteCollectPage.share();

        expect(sharedUrl).toContain(`/join/${room}`);
    });
});

test.describe('observer voting', () => {
    const users: TestUser[] = [
        { nickname: faker.internet.username(), observer: true },
    ];

    test.use({ testUsers: [users, { scope: 'test' }] });

    test.beforeEach(async ({ testUsers: [user], joinRoomPage, room }) => {
        await joinRoomPage.goto(room);
        await joinRoomPage.sendJoinForm({
            nickname: user.nickname,
            observer: user.observer,
        });
        await joinRoomPage.waitForRoom();
    });

    test('renders with a title', async ({ voteCollectPage }) => {
        await expect(voteCollectPage.pageHeader).toBeVisible();
    });

    test('renders with the user in list', async ({
        voteCollectPage,
        testUsers: [user],
    }) => {
        await expect(
            voteCollectPage.getUserListItem(user.nickname),
        ).toBeVisible();
    });

    test('do not allow the user to cast a vote by disabling all buttons', async ({
        voteCollectPage,
    }) => {
        const allBtnsCount = await voteCollectPage.getAllVoteSwitches().count();
        const disabledButtons = voteCollectPage.getAllDisabledVoteSwitches();

        await expect(disabledButtons).toHaveCount(allBtnsCount);
    });

    test('displays the correct status indicator', async ({
        voteCollectPage,
        testUsers: [user],
    }) => {
        await expect(
            voteCollectPage.getUserListItem(user.nickname),
        ).toBeVisible();
        await expect(
            voteCollectPage.getUserStatus(user.nickname),
        ).toHaveAccessibleName('Observer');
    });

    test('copies the room share URL to the clipboard', async ({
        voteCollectPage,
        room,
    }) => {
        const sharedUrl = await voteCollectPage.share();

        expect(sharedUrl).toContain(`/join/${room}`);
    });
});

type UserPage = {
    voteCollectPage: VoteCollect;
    user: TestUser;
    context: BrowserContext;
};

test.describe('multiple user voting', () => {
    let userPages: UserPage[] = [];

    const users: TestUser[] = [
        { nickname: faker.internet.username(), observer: true },
        { nickname: faker.internet.username(), observer: true },
        { nickname: faker.internet.username(), vote: '13', observer: false },
        { nickname: faker.internet.username(), vote: '13', observer: false },
        { nickname: faker.internet.username(), vote: '21', observer: false },
        { nickname: faker.internet.username(), vote: '5', observer: false },
    ];

    test.use({ testUsers: [users, { scope: 'test' }] });

    test.beforeEach(async ({ testUsers, room, browser }) => {
        await Promise.all(
            testUsers.map(async (user) => {
                const context = await browser.newContext({
                    storageState: undefined,
                });
                const page = await context.newPage();
                const joinRoomPage = new JoinRoom(page);

                await joinRoomPage.goto(room);
                await joinRoomPage.sendJoinForm({
                    nickname: user.nickname,
                    observer: user.observer,
                });

                await joinRoomPage.waitForRoom();

                userPages.push({
                    voteCollectPage: new VoteCollect(page),
                    context,
                    user,
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

    test('renders with a title', async ({}) => {
        await Promise.all(
            userPages.map(async ({ voteCollectPage }) => {
                await expect(voteCollectPage.pageHeader).toBeVisible();
            }),
        );
    });

    test('renders with the user in list', async ({}) => {
        await Promise.all(
            userPages.map(async ({ voteCollectPage, user: { nickname } }) => {
                await expect(
                    voteCollectPage.getUserListItem(nickname),
                ).toBeVisible();
            }),
        );
    });

    test('allows the users to cast a vote', async ({}) => {
        await Promise.all(
            userPages.map(async ({ voteCollectPage, user }) => {
                if (user.observer) {
                    return;
                }

                await voteCollectPage.vote(user.vote);
                await expect(
                    voteCollectPage.getCurrentVoteSwitch(),
                ).toBeVisible();
            }),
        );
    });

    test('displays the correct indicator', async ({}) => {
        await Promise.all(
            userPages.map(async ({ voteCollectPage, user }) => {
                const shouldVote = !user.observer && faker.datatype.boolean();
                if (shouldVote) {
                    await voteCollectPage.vote(user.vote);
                }

                await expect(
                    voteCollectPage.getUserStatus(user.nickname),
                ).toHaveAccessibleName(
                    shouldVote
                        ? 'Voted'
                        : user.observer
                        ? 'Observer'
                        : 'Not voted',
                );
            }),
        );
    });

    test('allows to kick an user', async ({}) => {
        const [sender, receiver] = faker.helpers.arrayElements(userPages, 2);

        const actionMenu = sender.voteCollectPage.getUserActionsButton(
            receiver.user.nickname,
        );

        await actionMenu.click();
        await sender.voteCollectPage.removeActionMenuItem.click();

        await Promise.all(
            userPages.map(async ({ voteCollectPage, user }) => {
                await expect(
                    voteCollectPage.getUserListItem(receiver.user.nickname),
                ).not.toBeVisible();

                if (user.nickname !== receiver.user.nickname) {
                    await expect(
                        voteCollectPage.getUserListItem(user.nickname),
                    ).toBeVisible();
                }
            }),
        );
    });
});
