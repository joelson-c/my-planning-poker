import { Badge } from '~/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '~/components/ui/card';
import { useVoteResultContext } from './context';

export function ResultSummary() {
    const { total, average, mediam } = useVoteResultContext();

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
                                    {average || 'N/A'}
                                </dd>
                            </Badge>
                        </div>
                        <div className="flex justify-between">
                            <dt>Median:</dt>
                            <Badge variant="secondary">
                                <dd data-testid="median">{mediam || 'N/A'}</dd>
                            </Badge>
                        </div>
                    </dl>
                </CardContent>
            </Card>
        </section>
    );
}
