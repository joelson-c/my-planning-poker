import { test as base } from './user';
import { faker } from '@faker-js/faker';
import { CreateRoom } from 'tests/pages/CreateRoom';
import { JoinRoom } from 'tests/pages/JoinRoom';
import { VoteCollect } from 'tests/pages/VoteCollect';

type Fixtures = {
    createRoom: CreateRoom;
    joinRoom: JoinRoom;
    voteCollectWithMultipleUsers: VoteCollect[];
    voteCollectWithSingleUser: VoteCollect;
    roomId: string;
};

export const test = base.extend<Fixtures>({
    createRoom: async ({ page }, use) => {
        const createRoom = new CreateRoom(page);
        await createRoom.goto();
        await use(createRoom);
    },
    joinRoom: async ({ page, roomId }, use) => {
        const joinRoom = new JoinRoom(page);
        await joinRoom.goto(roomId);
        await use(joinRoom);
    },
    voteCollectWithMultipleUsers: async (
        { pageWithVoteUsers, roomId },
        use,
    ) => {
        const voteCollectPages = await Promise.all(
            pageWithVoteUsers.map(async ([page, user]) => {
                const joinRoom = new JoinRoom(page);
                await joinRoom.goto(roomId);
                await joinRoom.sendJoinForm(user);
                await joinRoom.waitForRoom();

                return new VoteCollect(page);
            }),
        );

        await use(voteCollectPages);
    },
    voteCollectWithSingleUser: async (
        { pageWithVoteUser: [page, user], roomId },
        use,
    ) => {
        const joinRoom = new JoinRoom(page);
        await joinRoom.goto(roomId);
        await joinRoom.sendJoinForm(user);
        await joinRoom.waitForRoom();

        await use(new VoteCollect(page));
    },
    roomId: [
        async ({}, use) => {
            await use(faker.string.alphanumeric({ length: 12 }));
        },
        { box: true },
    ],
});
