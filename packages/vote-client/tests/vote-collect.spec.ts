import { expect } from '@playwright/test';
import { test } from './fixtures';
import { faker } from '@faker-js/faker';

test.describe('single user voting', () => {
    test.use({
        testUsers: [
            [
                {
                    nickname: faker.internet.username(),
                    vote: '13',
                    observer: false,
                },
            ],
            { scope: 'test' },
        ],
    });

    test('renders with the user in list', async ({
        voteCollectWithSingleUser,
        testUsers: [user],
    }) => {
        await expect(voteCollectWithSingleUser.pageHeader).toBeVisible();

        await expect(
            voteCollectWithSingleUser.getUserListItem(user.nickname),
        ).toBeVisible();
    });

    test('allows the user to cast a vote', async ({
        voteCollectWithSingleUser,
        testUsers: [user],
    }) => {
        await voteCollectWithSingleUser.vote('13');

        const expectedVoteBtn = voteCollectWithSingleUser.getVoteButton(
            user.vote!,
        );
        const checkedBtn = voteCollectWithSingleUser.getCurrentVoteSwitch();
        await expect(expectedVoteBtn).toBeChecked();
        await expect(checkedBtn).toHaveCount(1);
    });

    test('changes the status indicator when the user votes', async ({
        voteCollectWithSingleUser,
        testUsers: [user],
    }) => {
        await voteCollectWithSingleUser.vote('13');

        await expect(
            voteCollectWithSingleUser.getUserListItem(user.nickname),
        ).toBeVisible();
        await expect(
            voteCollectWithSingleUser.getUserStatus(user.nickname),
        ).toHaveAccessibleName('Voted');
    });

    test('copies the room share URL to the clipboard', async ({
        voteCollectWithSingleUser,
        roomId: room,
        browserName,
    }) => {
        test.skip(
            browserName === 'webkit',
            'Clipboard is not supported on WebKit engine',
        );

        const sharedUrl = await voteCollectWithSingleUser.share();

        expect(sharedUrl).toContain(`/join/${room}`);
    });
});

test.describe('observer voting', () => {
    test.use({
        testUsers: [
            [{ nickname: faker.internet.username(), observer: true }],
            { scope: 'test' },
        ],
    });

    test('renders with the user in list', async ({
        voteCollectWithSingleUser,
        testUsers: [user],
    }) => {
        await expect(voteCollectWithSingleUser.pageHeader).toBeVisible();

        await expect(
            voteCollectWithSingleUser.getUserListItem(user.nickname),
        ).toBeVisible();
    });

    test('do not allow the user to cast a vote by disabling all buttons', async ({
        voteCollectWithSingleUser,
    }) => {
        const disabledButtons =
            voteCollectWithSingleUser.getAllDisabledVoteSwitches();

        await expect(disabledButtons).toHaveCount(11);
    });

    test('displays the correct status indicator', async ({
        voteCollectWithSingleUser,
        testUsers: [user],
    }) => {
        await expect(
            voteCollectWithSingleUser.getUserListItem(user.nickname),
        ).toBeVisible();
        await expect(
            voteCollectWithSingleUser.getUserStatus(user.nickname),
        ).toHaveAccessibleName('Observer');
    });

    test('copies the room share URL to the clipboard', async ({
        voteCollectWithSingleUser,
        roomId: room,
        browserName,
    }) => {
        test.skip(
            browserName === 'webkit',
            'Clipboard is not supported on WebKit engine',
        );

        const sharedUrl = await voteCollectWithSingleUser.share();

        expect(sharedUrl).toContain(`/join/${room}`);
    });
});

test.describe('multiple user voting', () => {
    test('renders with the user in list', async ({
        voteCollectWithMultipleUsers,
        testUsers,
    }) => {
        await Promise.all(
            voteCollectWithMultipleUsers.map(async (page, idx) => {
                await expect(page.pageHeader).toBeVisible();

                await expect(
                    page.getUserListItem(testUsers[idx].nickname),
                ).toBeVisible();
            }),
        );
    });

    test('allows the users to cast a vote', async ({
        voteCollectWithMultipleUsers,
        testUsers,
    }) => {
        await Promise.all(
            voteCollectWithMultipleUsers.map(async (page, idx) => {
                const user = testUsers[idx];

                if (user.observer) {
                    return;
                }

                await page.vote(user.vote);
                await expect(page.getCurrentVoteSwitch()).toBeVisible();
            }),
        );
    });

    test('displays the correct indicator', async ({
        voteCollectWithMultipleUsers,
        testUsers,
    }) => {
        await Promise.all(
            voteCollectWithMultipleUsers.map(async (page, idx) => {
                const user = testUsers[idx];

                const shouldVote = !user.observer && faker.datatype.boolean();
                if (shouldVote) {
                    await page.vote(user.vote);
                }

                await expect(
                    page.getUserStatus(user.nickname),
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

    test('allows to kick an user', async ({
        voteCollectWithMultipleUsers,
        testUsers,
    }) => {
        const [senderIdx, receiverIdx] = [
            faker.number.int({
                max: testUsers.length - 1,
            }),
            faker.number.int({
                max: testUsers.length - 1,
            }),
        ];

        const senderPage = voteCollectWithMultipleUsers[senderIdx];
        const receiver = testUsers[receiverIdx];
        const actionMenu = senderPage.getUserActionsButton(receiver.nickname);

        await expect(actionMenu).toBeInViewport();

        await actionMenu.click();

        await expect(senderPage.removeActionMenuItem).toBeVisible();

        await senderPage.removeActionMenuItem.click();

        await Promise.all(
            voteCollectWithMultipleUsers.map(async (page, idx) => {
                const user = testUsers[idx];

                await expect(
                    page.getUserListItem(receiver.nickname),
                ).not.toBeVisible();

                if (user.nickname !== receiver.nickname) {
                    await expect(
                        page.getUserListItem(user.nickname),
                    ).toBeVisible();
                }
            }),
        );
    });
});
