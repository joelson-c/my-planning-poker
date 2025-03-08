import { expect } from '@playwright/test';
import { test } from './fixtures';

test.describe('single user voting', () => {
    test('renders with a title', async ({ firstUser }) => {
        await firstUser.goto();

        await expect(firstUser.pageHeader).toBeVisible();
    });

    test('renders with the user in list', async ({ firstUser }) => {
        await firstUser.goto();

        await expect(firstUser.getUserListItem()).toBeVisible();
    });

    test('allows the user to cast a vote', async ({ firstUser }) => {
        const voteValue = '13';
        await firstUser.goto();
        await firstUser.vote(voteValue);

        const expectedVoteBtn = firstUser.getVoteButton(voteValue);
        const checkedBtns = firstUser.page.getByRole('switch', {
            checked: true,
        });
        await expect(expectedVoteBtn).toBeChecked();
        await expect(checkedBtns).toHaveCount(1);
    });

    test('changes the status indicator when the user votes', async ({
        firstUser,
    }) => {
        await firstUser.goto();
        await firstUser.vote('13');

        await expect(firstUser.getUserListItem()).toBeVisible();
        await expect(firstUser.getStatusIndicator('Voted')).toBeVisible();
    });

    test('copies the room share URL to the clipboard', async ({
        firstUser,
    }) => {
        await firstUser.goto();
        const sharedUrl = await firstUser.share();

        expect(sharedUrl).toContain(`/join/${firstUser.roomId}`);
    });
});

test.describe('observer voting', () => {
    test('renders with a title', async ({ observerUser }) => {
        await observerUser.goto();

        await expect(observerUser.pageHeader).toBeVisible();
    });

    test('renders with the user in list', async ({ observerUser }) => {
        await observerUser.goto();

        await expect(observerUser.getUserListItem()).toBeVisible();
    });

    test('do not allow the user to cast a vote by disabling all buttons', async ({
        observerUser,
    }) => {
        await observerUser.goto();

        const allBtnsCount = await observerUser.page
            .getByRole('switch')
            .count();
        const disabledButtons = observerUser.page.getByRole('switch', {
            disabled: true,
        });

        await expect(disabledButtons).toHaveCount(allBtnsCount);
    });

    test('displays the correct status indicator', async ({ observerUser }) => {
        await observerUser.goto();

        await expect(observerUser.getUserListItem()).toBeVisible();
        await expect(observerUser.getStatusIndicator('Observer')).toBeVisible();
    });

    test('copies the room share URL to the clipboard', async ({
        observerUser,
    }) => {
        await observerUser.goto();
        const sharedUrl = await observerUser.share();

        expect(sharedUrl).toContain(`/join/${observerUser.roomId}`);
    });
});

test.describe('multiple user voting', () => {
    test('renders with a title', async ({ allUsers }) => {
        await Promise.all(
            allUsers.map(async (user) => {
                await user.goto();
                await expect(user.pageHeader).toBeVisible();
            }),
        );
    });

    test('renders with the user in list', async ({ allUsers }) => {
        await Promise.all(
            allUsers.map(async (user) => {
                await user.goto();
                await expect(user.getUserListItem()).toBeVisible();
            }),
        );
    });

    test('allows the users to cast a vote', async ({
        votingUsers,
        userVotes,
    }) => {
        await Promise.all(
            votingUsers.map(async (user) => {
                const voteValue = userVotes.get(user)!;

                await user.goto();
                await user.vote(voteValue);
            }),
        );

        await Promise.all(
            votingUsers.map(async (user) => {
                const voteValue = userVotes.get(user)!;

                const expectedVoteBtn = user.getVoteButton(voteValue);
                const checkedBtns = user.page.getByRole('switch', {
                    checked: true,
                });
                await expect(expectedVoteBtn).toBeChecked();
                await expect(checkedBtns).toHaveCount(1);
            }),
        );
    });

    test('displays the correct indicator', async ({
        allUsers,
        votingUsers,
        userVotes,
        observerUser,
    }) => {
        await Promise.all(
            allUsers.map(async (user) => {
                await user.goto();
                await expect(user.getUserListItem()).toBeVisible();
            }),
        );

        await Promise.all(
            votingUsers.map(async (user) => {
                const voteValue = userVotes.get(user)!;
                await user.vote(voteValue);
                await expect(user.getStatusIndicator('Voted')).toBeVisible();
            }),
        );

        await expect(observerUser.getStatusIndicator('Observer')).toBeVisible();
    });

    test('allows to kick an user', async ({ firstUser, observerUser }) => {
        await firstUser.goto();
        await observerUser.goto();

        const actionMenu = firstUser.userList
            .getByRole('listitem', {
                name: await observerUser.getNickname(),
            })
            .getByRole('button', { name: 'Open Menu' });

        await actionMenu.click();

        const removeAction = firstUser.page.getByRole('menuitem', {
            name: 'Remove',
        });

        await removeAction.click();

        await expect(observerUser.getUserListItem()).not.toBeVisible();
        await expect(firstUser.getUserListItem()).toBeVisible();
    });
});
