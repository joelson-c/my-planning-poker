import { test as base } from '@playwright/test';
import type { Faker } from '@faker-js/faker';
import { faker as fakerEn } from '@faker-js/faker/locale/en';

export const test = base.extend<{ faker: Faker }>({
    // eslint-disable-next-line no-empty-pattern
    faker: async ({}, use) => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        await use(fakerEn);
    },
});

export const faker = fakerEn;
