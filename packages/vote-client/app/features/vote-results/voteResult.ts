import type { VoteResult } from '~/types/voteResult';
import { backendClient } from '~/lib/backend/client';
import type { UserRecord } from '~/types/user';

export async function getVoteResults(): Promise<VoteResult> {
    const roomUsers = await backendClient.collection('voteUsers').getFullList();
    const userWithNonEmptyVotes = getUsersWithNonEmptyVotes(roomUsers);
    const total = userWithNonEmptyVotes.length;
    const distribution = getVoteDistribution(userWithNonEmptyVotes);
    const votesByUser = getVotesGroupedByUser(roomUsers);
    const allVotesValues = getVoteNumericValues(userWithNonEmptyVotes);
    const average = getVoteAverage(allVotesValues);
    const mediam = getMediam(allVotesValues);

    return {
        distribution,
        total,
        votesByUser,
        average,
        mediam,
    };
}

function getUsersWithNonEmptyVotes(roomUsers: UserRecord[]) {
    return roomUsers.filter(
        (user) => typeof user.vote !== 'undefined' && user.vote !== '',
    );
}

function getVoteDistribution(userWithNonEmptyVotes: UserRecord[]) {
    return userWithNonEmptyVotes.reduce((acc, user) => {
        const currentCount = acc[user.vote!] || 0;
        acc[user.vote!] = currentCount + 1;
        return acc;
    }, {} as Record<string, number>);
}

function getVotesGroupedByUser(roomUsers: UserRecord[]) {
    return roomUsers.reduce((acc, user) => {
        if (!user.vote) {
            return acc;
        }

        acc.push({
            id: user.id,
            nickname: user.nickname,
            vote: user.vote,
        });

        return acc;
    }, [] as VoteResult['votesByUser']);
}

function getVoteAverage(allVotesValues: number[]) {
    return allVotesValues.length > 0
        ? allVotesValues.reduce((a, b) => a + b) / allVotesValues.length
        : 0;
}

function getVoteNumericValues(userWithNonEmptyVotes: UserRecord[]) {
    return userWithNonEmptyVotes
        .filter(({ vote }) => vote && !isNaN(parseInt(vote, 10)))
        .map(({ vote }) => parseInt(vote!, 10));
}

function getMediam(allVotesValues: number[]) {
    if (!allVotesValues.length) {
        return;
    }

    if (allVotesValues.length === 1) {
        return allVotesValues[0];
    }

    let mediam;
    const sortedVotes = [...allVotesValues].sort((a, b) => a - b);
    if (sortedVotes.length % 2 === 0) {
        const middleValueIdx = Math.floor(sortedVotes.length / 2);
        const middleValues = sortedVotes.slice(
            middleValueIdx - 1,
            middleValueIdx + 1,
        );

        mediam = middleValues.reduce((a, b) => a + b) / middleValues.length;
    } else {
        mediam = sortedVotes[Math.floor(sortedVotes.length / 2)];
    }
    return mediam;
}
