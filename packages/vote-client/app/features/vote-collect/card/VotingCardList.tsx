import { getCardsForVariant } from '~/lib/voteCards';
import { VotingCardItem } from './VotingCardItem';
import { useActionState, useOptimistic, useTransition } from 'react';
import { backendClient } from '~/lib/backend/client';
import { useVoteContext } from '~/lib/context/vote';
import type { UserRecord } from '~/types/user';

type VoteState = string | null;

interface UserVotePayload {
    vote: VoteState;
    currentUser: UserRecord;
}

async function updateUserVote(
    _: VoteState,
    { vote, currentUser }: UserVotePayload,
) {
    const user = await backendClient
        .collection('voteUsers')
        .update(currentUser.id, {
            vote,
        });

    return user?.vote || null;
}

export function VotingCardList() {
    const { currentUser } = useVoteContext();
    // TODO: add realtime support for card types
    const cards = getCardsForVariant('FIBONACCI');

    const [currentVote, dispatchVote] = useActionState<
        VoteState,
        UserVotePayload
    >(updateUserVote, currentUser.vote || null);

    const [optimisticVote, setOptimisticVote] = useOptimistic<
        VoteState,
        string
    >(currentVote, (_, newCard) => newCard);
    const [, startTransition] = useTransition();

    const onVote = (vote: string) => {
        startTransition(() => {
            setOptimisticVote(vote);
            dispatchVote({
                vote,
                currentUser,
            });
        });
    };

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 lg:gap-4">
            {cards.map((card) => (
                <VotingCardItem
                    value={card}
                    selected={card === optimisticVote}
                    onClick={() => onVote(card)}
                    key={card}
                />
            ))}
        </div>
    );
}
