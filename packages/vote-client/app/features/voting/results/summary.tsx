import { useMemo } from 'react';
import { Badge } from '~/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '~/components/ui/card';
import { useRoomContext } from '~/routes/room/RoomProvider';

const UNKNOWN_VALUE_NUM = -1;

interface ResultSummaryProps {
    votes: {};
}

export function ResultSummary({ votes }: ResultSummaryProps) {
    const { room } = useRoomContext();

    const voteCount = useMemo(() => {
        return Object.values(votes).filter(({ vote }) => !!vote).length;
    }, [votes]);

    const cardNumericValues = useMemo(() => {
        return Object.values(votes).map(({ vote }) => {
            if (!vote) {
                return UNKNOWN_VALUE_NUM;
            }

            const parsedVote = Number.parseInt(vote, 10);
            if (!Number.isInteger(parsedVote)) {
                return UNKNOWN_VALUE_NUM;
            }

            return parsedVote;
        });
    }, [votes]);

    const voteAverage = useMemo(() => {
        if (!voteCount) {
            return 0;
        }

        if (room.cardType !== 'FIBONACCI') {
            // TODO: Assign values to "string" card
            return 'N/A';
        }

        const cardSum = cardNumericValues.reduce((acc, value) => {
            if (value === UNKNOWN_VALUE_NUM) {
                return acc;
            }

            return acc + value;
        }, 0);

        return Math.round(cardSum / voteCount);
    }, [cardNumericValues, room.cardType, voteCount]);

    const voteMedian = useMemo(() => {
        if (!voteCount) {
            return 0;
        }

        if (room.cardType !== 'FIBONACCI') {
            // TODO: Assign values to "string" card
            return 'N/A';
        }

        const midIndex = Math.floor(voteCount / 2);
        if (!midIndex) {
            return 'N/A';
        }

        const sortedValues = cardNumericValues
            .filter((v) => v !== UNKNOWN_VALUE_NUM)
            .sort();

        const median =
            cardNumericValues.length % 2 === 0
                ? (sortedValues[midIndex - 1] + sortedValues[midIndex]) / 2
                : sortedValues[midIndex];

        return Math.round(median);
    }, [cardNumericValues, room.cardType, voteCount]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    <div className="flex justify-between">
                        <span>Total Votes:</span>
                        <Badge variant="secondary">{voteCount}</Badge>
                    </div>
                    <div className="flex justify-between">
                        <span>Average:</span>
                        <Badge variant="secondary">{voteAverage}</Badge>
                    </div>
                    <div className="flex justify-between">
                        <span>Median:</span>
                        <Badge variant="secondary">{voteMedian}</Badge>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
