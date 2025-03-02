import { mergeTests } from '@playwright/test';

import { test as fakerFixture } from './faker';
import { test as roomFixture } from './room';

export const test = mergeTests(fakerFixture, roomFixture);
