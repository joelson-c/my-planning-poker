import type { VoteResult } from '@planningpoker/domain-models';
import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Progress } from '~/components/ui/progress';

interface ResultVoteDistributionProps {
    votes: VoteResult;
}

export function ResultVoteDistribution({ votes }: ResultVoteDistributionProps) {
    const voteCounts = useMemo(() => {
        return Object.values(votes).reduce((acc, { vote }) => {
            if (!vote) {
                return acc;
            }

            acc[vote] = (acc[vote] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
    }, [votes]);

    const voteCount = useMemo(() => {
        return Object.values(votes).filter(({ vote }) => !!vote).length;
    }, [votes]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Vote Distribution</CardTitle>
            </CardHeader>
            <CardContent>
                {Object.entries(voteCounts).map(([vote, count]) => (
                    <div key={vote} className="mb-4">
                        <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium">{vote}</span>
                            <span className="text-sm font-medium">
                                {count} vote{count !== 1 ? 's' : ''}
                            </span>
                        </div>
                        <Progress
                            value={(count / voteCount) * 100}
                            className="h-2"
                        />
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
