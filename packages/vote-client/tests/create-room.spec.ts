import { expect } from '@playwright/test';
import { test } from './fixtures';

test('renders with a title and create room button', async ({ createRoom }) => {
    await createRoom.goto();

    await expect(createRoom.pageHeader).toBeVisible();
    await expect(createRoom.createRoomButton).toBeVisible();
});

test('has a join room link', async ({ createRoom }) => {
    await createRoom.goto();
    await createRoom.joinRoom();
});

test('displays an error message when the nickname is too short', async ({
    createRoom,
}) => {
    await createRoom.goto();
    await createRoom.sendCreateForm('');

    await expect(createRoom.nicknameAlert).toBeVisible();
});

test('create a new room', async ({ createRoom, faker }) => {
    await createRoom.goto();
    await createRoom.sendCreateForm(faker.internet.username());
    const roomId = await createRoom.waitForRoom();

    expect(roomId).toBeTruthy();
});

test('remembers the last nickname used', async ({ createRoom, faker }) => {
    const nickname = faker.internet.username();

    await createRoom.goto();
    await createRoom.sendCreateForm(nickname);
    await createRoom.waitForRoom();
    await createRoom.goto();

    await expect(createRoom.nicknameInput).toHaveValue(nickname);
});
