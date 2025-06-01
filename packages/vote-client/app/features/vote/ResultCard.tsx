import type { RoomResult } from '~/lib/realtimeWorker/messages';
import { Distribution } from './result/Distribution';
import { IndividualVotes } from './result/IndividualVotes';
import { Summary } from './result/Summary';

interface ResultCardProps {
    result: RoomResult;
}

export function ResultCard({
    result: { distribution, total, average, median, votes },
}: ResultCardProps) {
    return (
        <div className="grid gap-6 lg:gap-8 md:grid-cols-2">
            <Distribution distribution={distribution} total={total} />
            <Summary total={total} average={average} median={median} />
            <IndividualVotes votes={votes} />
        </div>
    );
}
