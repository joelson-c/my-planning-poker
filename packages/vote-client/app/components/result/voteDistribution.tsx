import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';

const voteCounts = {
    '13': 9,
};

const maxVoteCount = 18;

export function ResultVoteDistribution() {
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
                            value={(count / maxVoteCount) * 100}
                            className="h-2"
                        />
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
