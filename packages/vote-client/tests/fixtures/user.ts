import { test as base, type Page } from '@playwright/test';
import { faker } from '@faker-js/faker';

type ObserverUser = {
    observer: true;
    vote?: never;
};

type VotingUser = {
    observer: false;
    vote: string;
};

export type TestUser = {
    nickname: string;
} & (ObserverUser | VotingUser);

export type Fixtures = {
    pageWithVoteUsers: [Page, TestUser][];
    pageWithVoteUser: [Page, TestUser];
};

export type Options = {
    testUsers: TestUser[];
};

export const test = base.extend<Fixtures & Options>({
    testUsers: [
        [
            {
                nickname: faker.internet.username(),
                observer: true,
            },
            {
                nickname: faker.internet.username(),
                vote: '13',
                observer: false,
            },
            {
                nickname: faker.internet.username(),
                vote: '13',
                observer: false,
            },
        ],
        { option: true },
    ],
    pageWithVoteUsers: async ({ browser, testUsers }, use) => {
        const contexts = await Promise.all(
            testUsers.map(() =>
                browser.newContext({
                    storageState: undefined,
                }),
            ),
        );

        const pages = await Promise.all(
            contexts.map((context) => context.newPage()),
        );
        await use(testUsers.map((user, idx) => [pages[idx], user]));

        await Promise.all(contexts.map((context) => context.close()));
    },
    pageWithVoteUser: async ({ page, testUsers }, use) => {
        const testUser =
            testUsers.length > 1
                ? faker.helpers.arrayElement(testUsers)
                : testUsers[0];

        await use([page, testUser]);
    },
});
