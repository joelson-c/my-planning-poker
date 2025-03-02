import { expect, type Locator, type Page } from '@playwright/test';

export class LoginRoom {
    readonly pageHeader: Locator;
    readonly nicknameInput: Locator;
    readonly roomIdInput: Locator;
    readonly observerSwitch: Locator;
    readonly joinRoomButton: Locator;
    readonly nicknameAlert: Locator;
    readonly roomIdAlert: Locator;
    readonly createRoomLink: Locator;

    constructor(readonly page: Page) {
        this.page = page;
        this.pageHeader = page.getByRole('heading', { name: 'Join a Room' });
        this.nicknameInput = page.getByRole('textbox', { name: 'Nickname' });
        this.roomIdInput = page.getByRole('textbox', { name: 'Room ID' });
        this.observerSwitch = page.getByRole('switch', {
            name: 'Join as Observer',
        });

        this.joinRoomButton = page.getByRole('button', {
            name: 'Join Room',
        });

        this.nicknameAlert = page.getByRole('alert').filter({
            hasText: 'String must contain at least 2 character(s)',
        });

        this.roomIdAlert = page.getByRole('alert').filter({
            hasText: 'String must contain at least 1 character(s)',
        });

        this.createRoomLink = page.getByRole('link', {
            name: 'Create a new room',
        });
    }

    async goto(roomId?: string) {
        if (roomId) {
            await this.page.goto(`/join/${roomId}`);
            return;
        }

        await this.page.goto('/join');
    }

    async sendJoinForm(
        nickname: string,
        roomId?: string,
        observer: boolean = false,
    ) {
        await this.nicknameInput.fill(nickname);
        if (roomId) {
            await this.roomIdInput.fill(roomId);
        }

        if (observer) {
            await this.observerSwitch.click();
        }

        const observerChecked = await this.observerSwitch.isChecked();
        expect(observerChecked).toBe(observer);

        await this.joinRoomButton.click();
    }

    async waitForRoom() {
        await this.page.waitForURL('**/room/*');
    }

    async createRoom() {
        await this.createRoomLink.click();
        await this.page.waitForURL('**/');
    }
}
