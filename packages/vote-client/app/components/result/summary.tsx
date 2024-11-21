import { Badge } from '../ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';

export function ResultSummary() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    <div className="flex justify-between">
                        <span>Total Votes:</span>
                        <Badge variant="secondary">{0}</Badge>
                    </div>
                    <div className="flex justify-between">
                        <span>Average:</span>
                        <Badge variant="secondary">{5}</Badge>
                    </div>
                    <div className="flex justify-between">
                        <span>Median:</span>
                        <Badge variant="secondary">{3}</Badge>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
