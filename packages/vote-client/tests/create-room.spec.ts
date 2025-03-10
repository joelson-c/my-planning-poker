import { expect } from '@playwright/test';
import { test } from './fixtures';
import { faker } from '@faker-js/faker';

test('renders with a title and create room button', async ({
    createRoomPage,
}) => {
    await createRoomPage.goto();

    await expect(createRoomPage.pageHeader).toBeVisible();
    await expect(createRoomPage.createRoomButton).toBeVisible();
});

test('has a join room link', async ({ createRoomPage }) => {
    await createRoomPage.goto();
    await createRoomPage.joinRoom();
});

test('displays an error message when the nickname is too short', async ({
    createRoomPage,
}) => {
    await createRoomPage.goto();
    await createRoomPage.sendCreateForm('');

    await expect(createRoomPage.nicknameAlert).toBeVisible();
});

test('create a new room', async ({ createRoomPage }) => {
    await createRoomPage.goto();
    await createRoomPage.sendCreateForm(faker.internet.username());
    const roomId = await createRoomPage.waitForRoom();

    expect(roomId).toBeTruthy();
});

test('remembers the last nickname used', async ({ createRoomPage }) => {
    const nickname = faker.internet.username();

    await createRoomPage.goto();
    await createRoomPage.sendCreateForm(nickname);
    await createRoomPage.waitForRoom();
    await createRoomPage.goto();

    await expect(createRoomPage.nicknameInput).toHaveValue(nickname);
});
