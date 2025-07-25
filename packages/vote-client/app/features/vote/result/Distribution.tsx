import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Progress } from '~/components/ui/progress';
import { roundNumber } from '~/lib/utils';

interface DistributionProps {
    distribution: Record<string, number>;
    total: number;
}

export function Distribution({ distribution, total }: DistributionProps) {
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
                                    aria-hidden="true"
                                >
                                    <span className="text-sm font-medium">
                                        {vote}
                                    </span>
                                    <span className="text-sm font-medium">
                                        {count} vote{count !== 1 ? 's' : ''}
                                    </span>
                                </div>
                                <Progress
                                    aria-valuenow={roundNumber(
                                        (count / total) * 100,
                                    )}
                                    value={(count / total) * 100}
                                    className="h-2"
                                    role="meter"
                                    aria-valuetext={`${count} vote(s) as '${vote}' out of ${total} in total`}
                                    data-vote={vote}
                                />
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
        </section>
    );
}
