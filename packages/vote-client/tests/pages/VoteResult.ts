import { type Locator, type Page } from '@playwright/test';

export class VoteResult {
    readonly pageHeader: Locator;
    readonly resetRoomButton: Locator;

    constructor(readonly page: Page, readonly roomId: string) {
        this.pageHeader = page.getByRole('heading', { name: 'Voting Results' });
        this.resetRoomButton = page.getByRole('button', {
            name: 'Start New Vote',
        });
    }
}
