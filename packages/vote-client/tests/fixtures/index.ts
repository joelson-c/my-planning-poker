import { mergeTests } from '@playwright/test';

import { test as roomFixture } from './room';
import { test as userFixture } from './user';

export const test = mergeTests(roomFixture, userFixture);
