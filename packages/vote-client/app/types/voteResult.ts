import type { UserRecord } from './user';

type Distribution = Record<string, number>;
type VoteByUser = Pick<UserRecord, 'id' | 'vote' | 'nickname'>[];

export interface VoteResult {
    distribution: Distribution;
    total: number;
    average?: number;
    mediam?: number;
    votesByUser: VoteByUser;
}
