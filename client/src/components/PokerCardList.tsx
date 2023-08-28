import PokerCard, { PokerCardsProps } from '../components/PokerCard';

type PokerCardListProps = {
    listItems: Record<string, string | null>;
    currentVote?: PokerCardsProps['value'];
    onVote: PokerCardsProps['onVote'];
}

export default function PokerCardList({ listItems, onVote, currentVote }: PokerCardListProps) {
    function onCardClick(value: string) {
        if (onVote) {
            onVote(value);
        }
    }

    return Object.entries(listItems).map(([value, description]) => (
        <div className='flex flex-col items-center gap-3' key={value}>
            <h3 className='text-bold text-2xl'>{description}</h3>
            <PokerCard
                value={value.toString()}
                onVote={onCardClick}
                key={value}
                isActive={currentVote?.toString() === value.toString()}
            />
        </div>
    ));
}
