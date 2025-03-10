import { test as base } from '@playwright/test';

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

export interface UserOptions {
    testUsers: TestUser[];
}

export const test = base.extend<UserOptions>({
    testUsers: [[], { option: true }],
});
