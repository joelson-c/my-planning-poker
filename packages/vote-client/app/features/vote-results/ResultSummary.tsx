import { Badge } from '~/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '~/components/ui/card';
import { useVoteResultContext } from './context';
import { roundNumber } from '~/lib/utils';

export function ResultSummary() {
    const { total, average, median } = useVoteResultContext();

    return (
        <section aria-labelledby="summary-title">
            <Card>
                <CardHeader>
                    <CardTitle id="summary-title">Summary</CardTitle>
                </CardHeader>
                <CardContent>
                    <dl className="space-y-2">
                        <div className="flex justify-between">
                            <dt>Total Votes:</dt>
                            <Badge variant="secondary">
                                <dd data-testid="total-votes">{total}</dd>
                            </Badge>
                        </div>
                        <div className="flex justify-between">
                            <dt>Average:</dt>
                            <Badge variant="secondary">
                                <dd data-testid="average">
                                    {average ? roundNumber(average) : 'N/A'}
                                </dd>
                            </Badge>
                        </div>
                        <div className="flex justify-between">
                            <dt>Median:</dt>
                            <Badge variant="secondary">
                                <dd data-testid="median">
                                    {median ? roundNumber(median) : 'N/A'}
                                </dd>
                            </Badge>
                        </div>
                    </dl>
                </CardContent>
            </Card>
        </section>
    );
}
