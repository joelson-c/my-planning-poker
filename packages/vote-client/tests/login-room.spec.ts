import { expect } from '@playwright/test';
import { test } from './fixtures';

test('renders with a title and join room button', async ({ loginRoom }) => {
    await loginRoom.goto();

    await expect(loginRoom.pageHeader).toBeVisible();
    await expect(loginRoom.joinRoomButton).toBeVisible();
});

test('has a create room link', async ({ loginRoom }) => {
    await loginRoom.goto();
    await loginRoom.createRoom();
});

test('displays an error message when the nickname is too short', async ({
    loginRoom,
}) => {
    await loginRoom.goto();
    await loginRoom.sendJoinForm('');

    await expect(loginRoom.nicknameAlert).toBeVisible();
});

test('displays an error message when the room id is too short', async ({
    loginRoom,
    faker,
}) => {
    await loginRoom.goto();
    await loginRoom.sendJoinForm(faker.internet.username(), '');

    await expect(loginRoom.roomIdAlert).toBeVisible();
});

test('joins a created room, specifying the room id in form', async ({
    faker,
    roomId,
    loginRoom,
}) => {
    await loginRoom.goto();
    await loginRoom.sendJoinForm(faker.internet.username(), roomId);
    await loginRoom.waitForRoom();
});

test('remembers the last nickname used', async ({
    faker,
    roomId,
    loginRoom,
}) => {
    const nickname = faker.internet.username();

    await loginRoom.goto();
    await loginRoom.sendJoinForm(nickname, roomId);
    await loginRoom.waitForRoom();
    await loginRoom.goto(roomId);

    await expect(loginRoom.nicknameInput).toHaveValue(nickname);
});

test('fills the room id input with the URL param', async ({ loginRoom }) => {
    const roomId = 'test123';

    await loginRoom.goto(roomId);

    await expect(loginRoom.roomIdInput).toHaveValue(roomId);
});
