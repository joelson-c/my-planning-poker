import PokerCard, { PokerCardsProps } from '../components/PokerCard';

export type PokerListItems = {
    key: string;
    value: string;
    description: string;
};

type PokerCardListProps = {
    listItems: PokerListItems[];
    currentVote?: PokerCardsProps['value'];
    onVote: PokerCardsProps['onVote'];
}

export default function PokerCardList({ listItems, onVote, currentVote }: PokerCardListProps) {
    function onCardClick(value: string) {
        if (onVote) {
            onVote(value);
        }
    }

    return listItems.map(({ key, value, description }) => (
        <div className='flex flex-col items-center gap-3' key={key}>
            <h3 className='text-bold text-2xl'>{description}</h3>
            <PokerCard
                value={value}
                onVote={onCardClick}
                key={value}
                isActive={currentVote?.toString() === value}
            />
        </div>
    ));
}
