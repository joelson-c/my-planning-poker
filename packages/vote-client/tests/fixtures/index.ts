import { mergeTests } from '@playwright/test';

import { test as pageFixture } from './pages';
import { test as baseFixture } from './base';
import { test as usersFixture } from './users';

export const test = mergeTests(baseFixture, pageFixture, usersFixture);
