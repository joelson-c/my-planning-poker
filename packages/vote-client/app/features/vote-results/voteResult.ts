import type { VoteResult } from '~/types/voteResult';
import { backendClient } from '~/lib/backend/client';

export async function getVoteResults(roomId: string): Promise<VoteResult> {
    const roomUsers = await backendClient.collection('voteUsers').getFullList({
        filter: backendClient.filter('room={:roomId}', { roomId }),
    });

    const userWithNonEmptyVotes = roomUsers.filter(
        (user) => typeof user.vote !== 'undefined' && user.vote !== '',
    );

    const total = userWithNonEmptyVotes.length;

    const distribution = userWithNonEmptyVotes.reduce((acc, user) => {
        const currentCount = acc[user.vote!] || 0;
        acc[user.vote!] = currentCount + 1;
        return acc;
    }, {} as Record<string, number>);

    const votesByUser = roomUsers.reduce((acc, user) => {
        acc.push({
            id: user.id,
            nickname: user.nickname,
            vote: user.vote!,
        });
        return acc;
    }, [] as VoteResult['votesByUser']);

    const allVotesValues = Object.keys(distribution)
        .filter((vote) => !isNaN(parseInt(vote, 10)))
        .map((vote) => parseInt(vote, 10));

    const average =
        total > 0 ? allVotesValues.reduce((a, b) => a + b) / total : 0;

    const mediam = total > 0 ? allVotesValues.sort()[Math.floor(total / 2)] : 0;

    return {
        distribution,
        total,
        votesByUser,
        average,
        mediam,
    };
}
