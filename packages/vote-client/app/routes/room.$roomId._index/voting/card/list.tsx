import type { action } from '../../route';
import { useVotingCards } from '~/routes/room.$roomId._index/use-voting-cards';
import { VotingCardItem } from './item';
import { useFetcher } from '@remix-run/react';
import { useMemo } from 'react';
import { useRoomContext } from '~/routes/room/RoomProvider';

export function VotingCardList() {
    const {
        room: { cardType },
    } = useRoomContext();
    const cards = useVotingCards(cardType);
    const voteFetcher = useFetcher<typeof action>();

    const onCardSelected = (card: string) => {
        voteFetcher.submit({ card }, { method: 'post' });
    };

    const selectedCard = useMemo(() => {
        return (
            voteFetcher.data?.card ||
            (voteFetcher.formData?.get('card') as string | undefined)
        );
    }, [voteFetcher.data?.card, voteFetcher.formData]);

    return (
        <div className="w-full lg:w-2/3">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
                {cards.map((card) => (
                    <VotingCardItem
                        key={card}
                        value={card}
                        selected={card === selectedCard}
                        onClick={() => onCardSelected?.(card)}
                    />
                ))}
            </div>
        </div>
    );
}
