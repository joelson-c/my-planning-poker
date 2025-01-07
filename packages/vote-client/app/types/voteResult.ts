type Distribution = Map<string, number>;
type VoteByUser = [string, string][];

export interface VoteResult {
    distribution: Distribution;
    total: number;
    average?: number;
    mediam?: number;
    votesByUser: VoteByUser;
}
