import type { Room } from '~/types/room';
import { useVotingCards } from '~/hooks/use-voting-cards';
import { VotingCardItem } from './item';
import { useFetcher } from 'react-router';
import { Fragment, useRef } from 'react';

interface VotingActionsProps {
    room: Room;
}

export function VotingCardList({ room }: VotingActionsProps) {
    const cards = useVotingCards(room.cardVariant);
    const voteFetcher = useFetcher();
    const formRef = useRef<HTMLFormElement>(null);

    const onCardSelected = () => {
        voteFetcher.submit(formRef.current);
    };

    const selectedCard =
        voteFetcher.data?.card ||
        (voteFetcher.formData?.get('card') as string | undefined);

    return (
        <div className="w-full lg:w-2/3">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
                <voteFetcher.Form
                    action={`/room/${room.id}/vote`}
                    method="post"
                    ref={formRef}
                >
                    {cards.map((card) => (
                        <Fragment key={card}>
                            <input type="hidden" name="vote" value={card} />
                            <VotingCardItem
                                value={card}
                                selected={card === selectedCard}
                                onClick={() => onCardSelected()}
                            />
                        </Fragment>
                    ))}
                </voteFetcher.Form>
            </div>
        </div>
    );
}
