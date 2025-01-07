import type { VoteResult } from '~/types/voteResult';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Progress } from '~/components/ui/progress';

interface ResultVoteDistributionProps {
    voteResult: VoteResult;
}

export function ResultVoteDistribution({
    voteResult: { distribution, total },
}: ResultVoteDistributionProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Vote Distribution</CardTitle>
            </CardHeader>
            <CardContent>
                {Array.from(distribution).map(([vote, count]) => (
                    <div key={vote} className="mb-4">
                        <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium">{vote}</span>
                            <span className="text-sm font-medium">
                                {count} vote{count !== 1 ? 's' : ''}
                            </span>
                        </div>
                        <Progress
                            value={(count / total) * 100}
                            className="h-2"
                        />
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
