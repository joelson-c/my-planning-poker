import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Progress } from '~/components/ui/progress';
import { useVoteResultContext } from './context';

export function ResultVoteDistribution() {
    const { distribution, total } = useVoteResultContext();

    return (
        <section aria-labelledby="distribution-title">
            <Card>
                <CardHeader>
                    <CardTitle id="distribution-title">
                        Vote Distribution
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ul aria-labelledby="distribution-title">
                        {Object.entries(distribution).map(([vote, count]) => (
                            <li key={vote} className="mb-4">
                                <div
                                    className="flex justify-between mb-1"
                                    role="presentation"
                                >
                                    <span className="text-sm font-medium">
                                        {vote}
                                    </span>
                                    <span className="text-sm font-medium">
                                        {count} vote{count !== 1 ? 's' : ''}
                                    </span>
                                </div>
                                <Progress
                                    aria-valuenow={(count / total) * 100}
                                    value={(count / total) * 100}
                                    className="h-2"
                                    role="meter"
                                    aria-valuetext={`${count} vote(s) as '${vote}' out of ${total} in total`}
                                />
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
        </section>
    );
}
