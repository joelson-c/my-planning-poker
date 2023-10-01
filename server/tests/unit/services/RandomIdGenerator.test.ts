import { assertType, beforeEach, expect, test } from 'vitest';
import RandomIdGenerator from '../../../src/services/RandomIdGenerator';

let generator: RandomIdGenerator;

beforeEach(() => {
    generator = new RandomIdGenerator();
});

test('generates a random number, given a length', () => {
    const result = generator.generateRandomId(5);

    assertType<string>(result);
    expect(result).toHaveLength(10);
});
