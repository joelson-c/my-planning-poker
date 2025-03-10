import { expect, type Locator, type Page } from '@playwright/test';

export class VoteCollect {
    readonly pageHeader: Locator;
    readonly revalCardsButton: Locator;
    readonly shareRoomButton: Locator;
    readonly userList: Locator;
    readonly removeActionMenuItem: Locator;

    constructor(readonly page: Page) {
        this.pageHeader = page.getByRole('heading', { name: 'Cast Your Vote' });

        this.revalCardsButton = page.getByRole('button', {
            name: 'Reveal Cards',
        });
        this.shareRoomButton = page.getByRole('button', { name: 'Share Room' });

        this.userList = page.getByRole('list', {
            name: 'Users in Room',
            exact: true,
        });

        this.removeActionMenuItem = page.getByRole('menuitem', {
            name: 'Remove',
        });
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

    getUserListItem(nickname: string) {
        return this.userList.getByRole('listitem', { name: nickname });
    }

    getUserStatus(nickname: string) {
        return this.getUserListItem(nickname).getByRole('status');
    }

    getAllVoteSwitches() {
        return this.page.getByRole('switch');
    }

    getAllDisabledVoteSwitches() {
        return this.page.getByRole('switch', { disabled: true });
    }

    getCurrentVoteSwitch() {
        return this.page.getByRole('switch', { checked: true });
    }

    getUserActionsButton(nickname: string) {
        return this.getUserListItem(nickname).getByRole('button', {
            name: 'Open Menu',
        });
    }
}
