import type { VoteResult } from '~/types/voteResult';
import { Badge } from '~/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '~/components/ui/card';

interface ResultSummaryProps {
    voteResult: VoteResult;
}

export function ResultSummary({
    voteResult: { total, average, mediam },
}: ResultSummaryProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    <div className="flex justify-between">
                        <span>Total Votes:</span>
                        <Badge variant="secondary">{total}</Badge>
                    </div>
                    <div className="flex justify-between">
                        <span>Average:</span>
                        <Badge variant="secondary">{average || 'N/A'}</Badge>
                    </div>
                    <div className="flex justify-between">
                        <span>Median:</span>
                        <Badge variant="secondary">{mediam || 'N/A'}</Badge>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
