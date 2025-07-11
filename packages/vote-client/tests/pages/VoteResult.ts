import type { Locator, Page } from '@playwright/test';
import { VoteCollect } from './VoteCollect';

export class VoteResult {
    readonly pageHeader: Locator;
    readonly resetRoomButton: Locator;
    readonly totalVotes: Locator;
    readonly average: Locator;
    readonly median: Locator;

    constructor(readonly page: Page) {
        this.pageHeader = page.getByRole('heading', { name: 'Voting Results' });
        this.resetRoomButton = page.getByRole('button', {
            name: 'Start New Vote',
        });

        this.totalVotes = page.getByTestId('total-votes');
        this.average = page.getByTestId('average');
        this.median = page.getByTestId('median');
    }

    getUserVote(nickname: string) {
        return this.page
            .getByRole('listitem', { name: `${nickname} voted: ` })
            .getByTestId('individual-vote');
    }

    getDistributionBarForVote(vote: string) {
        return this.page
            .getByRole('meter')
            .and(this.page.locator(`[data-vote="${vote}"]`));
    }

    async reset() {
        await this.resetRoomButton.click();
        const voteCollect = new VoteCollect(this.page);
        await voteCollect.pageHeader.waitFor({ state: 'visible' });
    }
}
