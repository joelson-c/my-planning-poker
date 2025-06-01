import type { Locator, Page } from '@playwright/test';

export class CreateRoom {
    readonly pageHeader: Locator;
    readonly nicknameInput: Locator;
    readonly createRoomButton: Locator;
    readonly nicknameAlert: Locator;
    readonly joinRoomLink: Locator;

    constructor(readonly page: Page) {
        this.page = page;
        this.pageHeader = page.getByRole('heading', { name: 'Create a Room' });
        this.nicknameInput = page.getByRole('textbox', { name: 'Nickname' });

        this.createRoomButton = page.getByRole('button', {
            name: 'Create New Room',
        });

        this.nicknameAlert = page.getByRole('alert').filter({
            hasText: 'String must contain at least 2 character(s)',
        });

        this.joinRoomLink = page.getByRole('link', {
            name: 'Join a Room',
        });
    }

    async goto() {
        await this.page.goto('/');
    }

    async sendCreateForm(nickname: string) {
        await this.nicknameInput.fill(nickname);
        await this.createRoomButton.click();
    }

    async waitForRoom(): Promise<string> {
        await this.page.waitForURL('**/room/*');

        const roomIdMath = this.page.url().match(/(?<=room\/).*$/);
        if (!roomIdMath) {
            throw new Error('Room ID not found in page URL');
        }

        return roomIdMath[0];
    }

    async joinRoom() {
        await this.joinRoomLink.click();
        await this.page.waitForURL('**/join');
    }
}
