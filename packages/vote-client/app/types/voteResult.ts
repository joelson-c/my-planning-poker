import type { User } from './user';

type Distribution = Map<string, number>;
type VoteByUser = Pick<User, 'id' | 'vote' | 'nickname'>[];

export interface VoteResult {
    distribution: Distribution;
    total: number;
    average?: number;
    mediam?: number;
    votesByUser: VoteByUser;
}
