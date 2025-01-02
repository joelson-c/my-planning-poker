import type { Room } from '~/types/room';
import { useVotingCards } from '~/hooks/use-voting-cards';
import { VotingCardItem } from './item';
import { useFetcher } from 'react-router';
import { Fragment, useRef } from 'react';

interface VotingActionsProps {
    room: Room;
}

export function VotingCardList({ room }: VotingActionsProps) {
    const cards = useVotingCards(room.cardType);
    const voteFetcher = useFetcher();
    const formRef = useRef<HTMLFormElement>(null);
    const valueInputRef = useRef<HTMLInputElement>(null);

    const onCardSelected = (card: string) => {
        if (!valueInputRef.current) {
            return;
        }

        valueInputRef.current.value = card;
        voteFetcher.submit(formRef.current);
    };

    const selectedCard =
        voteFetcher.data?.value ||
        (voteFetcher.formData?.get('value') as string | undefined);

    return (
        <div className="w-full lg:w-2/3">
            <voteFetcher.Form
                action={`/room/${room.id}/vote`}
                method="post"
                ref={formRef}
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6"
            >
                <input type="hidden" name="value" ref={valueInputRef} />
                {cards.map((card) => (
                    <Fragment key={card}>
                        <VotingCardItem
                            value={card}
                            selected={card === selectedCard}
                            onClick={() => onCardSelected(card)}
                        />
                    </Fragment>
                ))}
            </voteFetcher.Form>
        </div>
    );
}
