import PokerCard, { PokerCardsProps } from '../components/PokerCard';

export type PokerCardListItems = Array<PokerCardsProps & { key: string }>;

type PokerCardListProps = {
    listItems: PokerCardListItems;
}

export default function PokerCardList({ listItems }: PokerCardListProps) {
    return (
        <div className='grid gap-3 grid-cols-card-list lg:grid-cols-card-list-lg justify-center'>
            {listItems.map((cardProps) => (
                <PokerCard {...cardProps} />
            ))}
        </div>
    );
}
