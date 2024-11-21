import type { Infer } from 'superstruct';
import { string, object, intersection } from 'superstruct';
import { authenticationData } from './authentication-data';

export const joinData = intersection([
    authenticationData,
    object({
        roomId: string(),
    }),
]);

export type JoinData = Infer<typeof joinData>;
