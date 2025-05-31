import type { Locator, Page } from '@playwright/test';
import { VoteResult } from './VoteResult';

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
        await voteButton.click();
    }

    async share(): Promise<string> {
        await this.page
            .context()
            .grantPermissions(['clipboard-read', 'clipboard-write']);

        await this.shareRoomButton.click();
        await this.page
            .getByText('Room link copied!', { exact: true })
            .waitFor({ state: 'visible' });

        const copiedValue = await this.page.evaluate(() =>
            navigator.clipboard.readText(),
        );

        return copiedValue;
    }

    async reveal() {
        await this.revalCardsButton.click();
        const voteResult = this.getVoteResultPage();
        await voteResult.pageHeader.waitFor({
            state: 'visible',
        });
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

    getVoteResultPage() {
        return new VoteResult(this.page);
    }
}
