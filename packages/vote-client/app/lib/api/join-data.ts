import type { Infer } from 'superstruct';
import { string, object, assign } from 'superstruct';
import { authenticationData } from './authentication-data';

export const joinData = assign(
    authenticationData,
    object({
        roomId: string(),
    }),
);

export type JoinData = Infer<typeof joinData>;
