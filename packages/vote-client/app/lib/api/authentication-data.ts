import type { Infer } from 'superstruct';
import {
    size,
    string,
    object,
    defaulted,
    boolean,
    optional,
} from 'superstruct';

export const authenticationData = object({
    nickname: size(string(), 1, 20),
    isObserver: defaulted(optional(boolean()), false),
});

export type AuthenticationData = Infer<typeof authenticationData>;
