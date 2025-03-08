import { expect, type Locator, type Page } from '@playwright/test';

export class VoteCollect {
    readonly pageHeader: Locator;
    readonly revalCardsButton: Locator;
    readonly shareRoomButton: Locator;
    readonly userList: Locator;
    private nickname: string | null = null;

    constructor(readonly page: Page, readonly roomId: string) {
        this.pageHeader = page.getByRole('heading', { name: 'Cast Your Vote' });
        this.revalCardsButton = page.getByRole('button', {
            name: 'Reveal Cards',
        });
        this.shareRoomButton = page.getByRole('button', { name: 'Share Room' });
        this.userList = page.getByRole('list', {
            name: 'Users in Room',
            exact: true,
        });
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
        return this.page.getByRole('switch', { name: vote, exact: true });
    }

    getStatusIndicator(status: string) {
        return this.getUserListItem().getByRole('status', {
            name: status,
            exact: true,
        });
    }

    getUserListItem() {
        return this.userList
            .getByRole('listitem')
            .and(this.userList.locator('[data-ref="self"]'));
    }

    async getNickname() {
        if (!this.nickname) {
            this.nickname = await this.page.evaluate(() => {
                return localStorage.getItem('lastNickname') || '';
            });
        }

        return this.nickname;
    }
}
