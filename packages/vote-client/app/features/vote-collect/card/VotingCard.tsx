import type { Room } from '~/types/room';
import { Separator } from '~/components/ui/separator';
import { VotingCardList } from './VotingCardList';
import { VotingActionList } from '../VotingActionList';
import { VotingCardSkeleton } from './VotingCardSkeleton';

interface VotingCardProps {
    room?: Room | null;
    disabled?: boolean;
}

export function VotingCard({ room, disabled: isObserver }: VotingCardProps) {
    if (!room) {
        return <VotingCardSkeleton />;
    }

    return (
        <>
            <VotingCardList room={room} disabled={isObserver} />
            <Separator className="my-6" />
            <VotingActionList room={room} />
        </>
    );
}
