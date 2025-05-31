import type { TestUser } from './fixtures/user';
import { expect } from '@playwright/test';
import { test } from './fixtures';
import { VoteResult } from './pages/VoteResult';
import { JoinRoom } from './pages/JoinRoom';
import { faker } from '@faker-js/faker';

test.describe('page transitions', () => {
    test('goes to result page, when the reveal button is clicked', async ({
        voteCollectWithMultipleUsers,
    }) => {
        const [firstUser] = voteCollectWithMultipleUsers;
        await firstUser.reveal();

        await Promise.all(
            voteCollectWithMultipleUsers.map(async (collectPage) => {
                await expect(
                    collectPage.getVoteResultPage().pageHeader,
                ).toBeVisible();
            }),
        );
    });

    test('goes to voting page, when the reset room button is clicked', async ({
        voteCollectWithMultipleUsers,
    }) => {
        const [firstUser, secondUser] = voteCollectWithMultipleUsers;
        await firstUser.reveal();
        const voteResult = new VoteResult(secondUser.page);
        await voteResult.reset();

        await Promise.all(
            voteCollectWithMultipleUsers.map(async (collectPage) => {
                await expect(collectPage.pageHeader).toBeVisible();
            }),
        );
    });
});

test.describe('within vote results', () => {
    const users: TestUser[] = [
        { nickname: faker.internet.username(), vote: '13', observer: false },
        { nickname: faker.internet.username(), vote: '21', observer: false },
        { nickname: faker.internet.username(), vote: '21', observer: false },
        { nickname: faker.internet.username(), observer: true },
    ];

    test.use({ testUsers: [users, { scope: 'test' }] });

    test.beforeEach(async ({ voteCollectWithMultipleUsers, testUsers }) => {
        await Promise.all(
            voteCollectWithMultipleUsers.map(async (collectPage, idx) => {
                const user = testUsers[idx];
                if (!user.vote) {
                    return;
                }

                await collectPage.vote(user.vote);
            }),
        );

        const [firstUser] = voteCollectWithMultipleUsers;
        await firstUser.reveal();
    });

    test('renders with a title after a voting', async ({
        voteCollectWithMultipleUsers,
    }) => {
        await Promise.all(
            voteCollectWithMultipleUsers.map(async (collectPage) => {
                await expect(
                    collectPage.getVoteResultPage().pageHeader,
                ).toBeVisible();
            }),
        );
    });

    test('shows the individual user votes', async ({
        voteCollectWithMultipleUsers,
        testUsers,
    }) => {
        await Promise.all(
            voteCollectWithMultipleUsers.map(async (collectPage, idx) => {
                const user = testUsers[idx];
                const resultPage = collectPage.getVoteResultPage();
                if (!user.vote) {
                    await expect(
                        resultPage.getUserVote(user.nickname),
                    ).not.toBeVisible();

                    return;
                }

                await expect(resultPage.getUserVote(user.nickname)).toHaveText(
                    user.vote,
                );
            }),
        );
    });

    test('shows the correct summary data', async ({
        voteCollectWithMultipleUsers,
    }) => {
        await Promise.all(
            voteCollectWithMultipleUsers.map(async (collectPage) => {
                const resultPage = collectPage.getVoteResultPage();

                await expect(resultPage.totalVotes).toHaveText('3');
                await expect(resultPage.average).toHaveText('18.3');
                await expect(resultPage.median).toHaveText('21');
            }),
        );
    });

    test('shows the correct vote distribution', async ({
        voteCollectWithMultipleUsers,
    }) => {
        await Promise.all(
            voteCollectWithMultipleUsers.map(async (collectPage) => {
                const resultPage = collectPage.getVoteResultPage();

                await expect(
                    resultPage.getDistributionBarForVote('13'),
                ).toHaveAttribute('aria-valuenow', '33.3');

                await expect(
                    resultPage.getDistributionBarForVote('21'),
                ).toHaveAttribute('aria-valuenow', '66.7');
            }),
        );
    });

    test('does not mutate the result, when a user enters the room', async ({
        voteCollectWithMultipleUsers,
        page: defaultPage,
        roomId: room,
    }) => {
        const joinRoomPage = new JoinRoom(defaultPage);

        await joinRoomPage.goto(room);
        await joinRoomPage.sendJoinForm({
            nickname: 'Extra User',
            observer: false,
        });

        const extraUserResultPage = new VoteResult(defaultPage);

        await expect(extraUserResultPage.pageHeader).toBeVisible();
        await expect(extraUserResultPage.totalVotes).toHaveText('3');

        await Promise.all(
            voteCollectWithMultipleUsers.map(async (collectPage) => {
                await expect(
                    collectPage.getVoteResultPage().totalVotes,
                ).toHaveText('3');
            }),
        );
    });
});
