import { useMemo } from 'react';

import { Divider, Progress } from '@nextui-org/react';

import { useRootStore } from '../state/rootStore';

const UNKNOWN_VALUE = 'N/A';

export default function VoteStats() {
    const { meta: roomMeta, users: roomUsers } = useRootStore((state) => ({
        meta: state.roomMeta,
        users: state.roomUsers || []
    }));

    const averageVote = useMemo(() => {
        const numericVotes = roomUsers
            .map((roomUser) => {
                const numericVote = parseInt(roomUser?.votingValue || '', 10);
                if (isNaN(numericVote)) {
                    return null;
                }

                return numericVote;
            })
            .filter((vote) => vote !== null) as number[];

        if (!numericVotes.length) {
            return UNKNOWN_VALUE;
        }

        return (numericVotes.reduce((acc, value) => acc + value, 0) / numericVotes.length).toFixed(1);
    }, [roomUsers]);

    const groupedVotesByCount = useMemo(() => {
        const roomUsersGroupByVote = roomUsers.reduce((acc, roomUser) => {
            if (roomUser.votingValue === undefined) {
                return acc;
            }

            acc.set(roomUser.votingValue, (acc.get(roomUser.votingValue) || 0) + 1);
            return acc;
        }, new Map<string, number>());

        return roomUsersGroupByVote;
    }, [roomUsers]);

    const majorityVote = useMemo(() => {
        if (!groupedVotesByCount.size) {
            return UNKNOWN_VALUE;
        }

        const uniqueVotes = new Set([...groupedVotesByCount.values()].map((vote) => vote));
        if (uniqueVotes.size === roomUsers.length) {
            // All votes are unique, so it's a tie
            return UNKNOWN_VALUE;
        }

        const votes = [...groupedVotesByCount.entries()];
        votes.sort(([, firstCount], [, secondCount]) => secondCount - firstCount);

        const [topVoteValue,] = votes[0];

        return topVoteValue;
    }, [groupedVotesByCount, roomUsers.length]);

    if (!roomMeta?.hasRevealedCards) {
        return null;
    }

    return (
        <div className='text-center'>
            <h2 className='text-xl font-bold'>Votos</h2>
            <Divider className='my-2' />
            <div className="flex flex-col gap-2">
                <dl>
                    <dt className='text-lg'>Pontuação votada pela maioria</dt>
                    <dd className='text-3xl font-bold'>{majorityVote}</dd>
                </dl>
                <dl>
                    <dt className='text-lg'>Pontuação média</dt>
                    <dd className='text-3xl font-bold'>{averageVote}</dd>
                </dl>
            </div>
            <div className="flex flex-col gap-3 my-2">
                {[...groupedVotesByCount.entries()].map(([voteValue, voteCount]) => (
                    <Progress
                        key={voteValue}
                        label={voteValue}
                        value={voteCount / roomUsers.length}
                        maxValue={1}
                        showValueLabel={true} />
                ))}
            </div>
        </div>
    );
}
