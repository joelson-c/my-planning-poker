import { expect } from '@playwright/test';
import { test } from './fixtures';
import { faker } from '@faker-js/faker';

test('renders with a title and join room button', async ({
    joinRoom: joinRoomPage,
}) => {
    await joinRoomPage.goto();

    await expect(joinRoomPage.pageHeader).toBeVisible();
    await expect(joinRoomPage.joinRoomButton).toBeVisible();
});

test('has a create room link', async ({ joinRoom: joinRoomPage }) => {
    await joinRoomPage.goto();
    await joinRoomPage.createRoom();
});

test('displays an error message when the nickname is too short', async ({
    joinRoom: joinRoomPage,
}) => {
    await joinRoomPage.goto();
    await joinRoomPage.sendJoinForm({ nickname: 'a' });

    await expect(joinRoomPage.nicknameAlert).toBeVisible();
});

test('displays an error message when the room id is too short', async ({
    joinRoom: joinRoomPage,
}) => {
    await joinRoomPage.goto();
    await joinRoomPage.sendJoinForm({
        nickname: faker.internet.username(),
        room: '',
    });

    await expect(joinRoomPage.roomIdAlert).toBeVisible();
});

test('joins a created room, specifying the room id in form', async ({
    roomId: room,
    joinRoom: joinRoomPage,
}) => {
    await joinRoomPage.goto();
    await joinRoomPage.sendJoinForm({
        nickname: faker.internet.username(),
        room,
    });
    await joinRoomPage.waitForRoom();
});

test('remembers the last nickname used', async ({
    roomId: room,
    joinRoom: joinRoomPage,
}) => {
    const nickname = faker.internet.username();

    await joinRoomPage.goto();
    await joinRoomPage.sendJoinForm({ nickname, room });
    await joinRoomPage.waitForRoom();
    await joinRoomPage.goto(room);

    await expect(joinRoomPage.nicknameInput).toHaveValue(nickname);
});

test('joins a created room, specifying the room id in URL', async ({
    roomId: room,
    joinRoom: joinRoomPage,
}) => {
    await joinRoomPage.goto(room);
    await joinRoomPage.sendJoinForm({ nickname: faker.internet.username() });
    await joinRoomPage.waitForRoom();
});

test('joins a created room, as observer', async ({
    roomId: room,
    joinRoom: joinRoomPage,
}) => {
    await joinRoomPage.goto(room);
    await joinRoomPage.sendJoinForm({
        nickname: faker.internet.username(),
        observer: true,
    });
    await joinRoomPage.waitForRoom();
});
