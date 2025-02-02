import type { Room } from '~/types/room';
import { useVotingCards } from '~/lib/useVotingCards';
import { VotingCardItem } from './VotingCardItem';
import { Fragment, useOptimistic, useState, useTransition } from 'react';
import { getCurrentUserOrThrow } from '~/lib/backend/auth';
import { backendClient } from '~/lib/backend/client';

interface VotingActionsProps {
    room: Room;
    disabled?: boolean;
}

export function VotingCardList({ room, disabled }: VotingActionsProps) {
    const cards = useVotingCards(room.cardType);
    const [selectedCard, setSelectedCard] = useState<string | undefined>();
    const [optimisticCard, setOptimisticCard] = useOptimistic<
        typeof selectedCard,
        string
    >(selectedCard, (_, newCard) => newCard);
    const [, startTransition] = useTransition();

    const onCardSelected = (card: string) => {
        startTransition(async () => {
            startTransition(() => {
                setOptimisticCard(card);
            });

            const currentUser = getCurrentUserOrThrow();
            const user = await backendClient
                .collection('voteUsers')
                .update(currentUser.id, {
                    vote: card,
                });

            startTransition(() => {
                setSelectedCard(user?.vote);
            });
        });
    };

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 lg:gap-4">
            {cards.map((card) => (
                <Fragment key={card}>
                    <VotingCardItem
                        value={card}
                        selected={card === optimisticCard}
                        onClick={() => onCardSelected(card)}
                        disabled={disabled}
                    />
                </Fragment>
            ))}
        </div>
    );
}
