import { mergeTests } from '@playwright/test';

import { type Options as UserOptions } from './user';
import { test as roomTest } from './room';

export type Options = UserOptions;

export const test = mergeTests(roomTest);
