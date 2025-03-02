import { expect, type Locator, type Page } from '@playwright/test';

export class VoteCollect {
    readonly pageHeader: Locator;
    readonly revalCardsButton: Locator;
    readonly shareRoomButton: Locator;

    constructor(readonly page: Page, readonly roomId: string) {
        this.pageHeader = page.getByRole('heading', { name: 'Cast Your Vote' });
        this.revalCardsButton = page.getByRole('button', {
            name: 'Reveal Cards',
        });
        this.shareRoomButton = page.getByRole('button', { name: 'Share Room' });
        this.shareRoomButton = page.getByRole('button', { name: 'Share Room' });
    }

    async goto() {
        await this.page.goto(`/room/${this.roomId}`);
    }

    async vote(vote: string) {
        const voteButton = this.getVoteButton(vote);
        await voteButton.check();
        await expect(voteButton).toBeChecked();
    }

    async share(): Promise<string> {
        await this.page
            .context()
            .grantPermissions(['clipboard-read', 'clipboard-write']);

        this.shareRoomButton.click();
        await expect(
            this.page.getByText('Room link copied!', { exact: true }),
        ).toBeVisible();

        const copiedValue = await this.page.evaluate(() =>
            navigator.clipboard.readText(),
        );

        return copiedValue;
    }

    async reveal() {
        this.revalCardsButton.click();
        await this.page.waitForURL('**/room/*/result');
    }

    getVoteButton(vote: string) {
        return this.page.getByRole('switch', { name: vote });
    }

    getStatusIndicator(status: string) {
        return this.page.getByRole('status', { name: status, exact: true });
    }

    async getUserListItem() {
        return this.page.getByText(await this.getNickname());
    }

    getNickname() {
        return this.page.evaluate(() => {
            return localStorage.getItem('lastNickname') || '';
        });
    }
}
