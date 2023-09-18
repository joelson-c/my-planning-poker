import { useMemo } from "react";
import useFibonacciSequence from "./useFibonacciSequence";
import useRoomData from "./useRoomData";
import { PokerCardListItems } from "../components/PokerCardList";

export default function useRoomCards(onVoteChanged: (value: string) => void, vote?: string): PokerCardListItems {
    const fibSeq = useFibonacciSequence(89);
    const { meta: roomMeta, users: roomUsers } = useRoomData();

    return useMemo(() => {
        if (roomMeta?.hasRevealedCards) {
            return (roomUsers || []).reduce((acc, roomUser) => {
                if (roomUser.isObserver) {
                    return acc;
                }

                acc.push({
                    key: roomUser.id,
                    description: roomUser.username,
                    value: roomUser.votingValue || 'N/A',
                    onVote: onVoteChanged
                });

                return acc;
            }, [] as PokerCardListItems);
        }

        return [
            ...fibSeq,
            '?',
            '☕'
        ].reduce((acc, card) => {
            acc.push({
                key: card.toString(),
                value: card.toString(),
                isActive: vote === card.toString(),
                onVote: onVoteChanged
            });
            return acc;
        }, [] as PokerCardListItems);
    }, [roomMeta?.hasRevealedCards, fibSeq, roomUsers, onVoteChanged, vote]);
}
