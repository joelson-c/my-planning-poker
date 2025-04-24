import { getCardsForVariant } from '~/lib/voteCards';
import { VotingCardItem } from './VotingCardItem';

interface VotingCardListProps {
    onVote: (vote: string) => void;
    currentVote?: string;
    disabled?: boolean;
}

export function VotingCardList({
    onVote,
    currentVote,
    disabled,
}: VotingCardListProps) {
    // TODO: add realtime support for card types
    const cards = getCardsForVariant('FIBONACCI');

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 lg:gap-4">
            {cards.map((card) => (
                <VotingCardItem
                    value={card}
                    selected={card === currentVote}
                    onClick={() => onVote(card)}
                    key={card}
                    disabled={disabled}
                />
            ))}
        </div>
    );
}
