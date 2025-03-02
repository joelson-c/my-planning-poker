import { expect } from '@playwright/test';
import { test } from './fixtures';

test.describe('single user voting', () => {
    test.describe.configure({ mode: 'serial' });

    test('renders with a title', async ({ firstUser }) => {
        await firstUser.goto();

        await expect(firstUser.pageHeader).toBeVisible();
    });

    test('renders with the user in list', async ({ firstUser }) => {
        await firstUser.goto();

        await expect(await firstUser.getUserListItem()).toBeVisible();
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

        await expect(await firstUser.getUserListItem()).toBeVisible();
        await expect(firstUser.getStatusIndicator('Voted')).toBeVisible();
    });

    test('copies the room share URL to the clipboard', async ({
        firstUser,
    }) => {
        await firstUser.goto();
        const sharedUrl = await firstUser.share();

        expect(sharedUrl).toContain(`/join/${firstUser.roomId}`);
    });

    test('goes to result page when the user reveals the cards', async ({
        firstUser,
    }) => {
        await firstUser.goto();
        await firstUser.vote('13');
        await firstUser.reveal();
    });
});
