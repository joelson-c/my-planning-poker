import { test as base } from '@playwright/test';
import type { Faker } from '@faker-js/faker';
import { faker as fakerEn } from '@faker-js/faker/locale/en';

interface WorkerFixtures {
    faker: Faker;
}

export const test = base.extend<object, WorkerFixtures>({
    faker: [
        // eslint-disable-next-line no-empty-pattern
        async ({}, use) => {
            await use(fakerEn);
        },
        { scope: 'worker' },
    ],
});

export const faker = fakerEn;
