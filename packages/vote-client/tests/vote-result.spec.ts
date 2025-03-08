import { expect } from '@playwright/test';
import { test } from './fixtures';
import { VoteResult } from './pages/VoteResult';

test('renders with a title', async ({ firstUser, secondUser }) => {
    await firstUser.goto();
    await firstUser.vote('13');
    await secondUser.goto();
    await secondUser.vote('13');
    await firstUser.reveal();

    const firstUserResult = new VoteResult(firstUser.page, firstUser.roomId);
    const secondUserResult = new VoteResult(secondUser.page, secondUser.roomId);

    await expect(firstUserResult.pageHeader).toBeVisible();
    await expect(secondUserResult.pageHeader).toBeVisible();
});

test('shows the individual user votes', async ({ firstUser, secondUser }) => {
    await firstUser.goto();
    await firstUser.vote('13');
    await secondUser.goto();
    await secondUser.vote('21');
    await secondUser.reveal();

    const firstUserResult = new VoteResult(firstUser.page, firstUser.roomId);
    const secondUserResult = new VoteResult(secondUser.page, secondUser.roomId);

    await expect(
        firstUserResult.getUserVote(await firstUser.getNickname()),
    ).toHaveText('13');
    await expect(
        secondUserResult.getUserVote(await secondUser.getNickname()),
    ).toHaveText('21');
});

test('shows the correct summary data', async ({ firstUser, secondUser }) => {
    await firstUser.goto();
    await firstUser.vote('8');
    await secondUser.goto();
    await secondUser.vote('13');
    await secondUser.reveal();

    const firstUserResult = new VoteResult(firstUser.page, firstUser.roomId);

    await expect(firstUserResult.totalVotes).toHaveText('2');
    await expect(firstUserResult.average).toHaveText('10.5');
    await expect(firstUserResult.median).toHaveText('10.5');
});
