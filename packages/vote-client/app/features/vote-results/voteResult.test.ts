import type { UserRecord } from '~/types/user';
import { getVoteResults } from './voteResult';
import { describe, it, vi } from 'vitest';

const mockUsers: UserRecord[] = [
    {
        id: '1',
        nickname: 'User1',
        active: true,
        hasVoted: true,
        observer: false,
        room: '123',
        vote: '13',
        collectionId: '123',
        collectionName: 'voteUsers',
        owner: true,
    },
    {
        id: '2',
        nickname: 'User2',
        active: true,
        hasVoted: true,
        observer: false,
        room: '123',
        vote: '21',
        collectionId: '123',
        collectionName: 'voteUsers',
        owner: true,
    },
    {
        id: '3',
        nickname: 'User3',
        active: true,
        hasVoted: true,
        observer: false,
        room: '123',
        vote: '13',
        collectionId: '123',
        collectionName: 'voteUsers',
        owner: true,
    },
    {
        id: '4',
        nickname: 'User4',
        active: true,
        hasVoted: true,
        observer: false,
        room: '123',
        vote: '21',
        collectionId: '123',
        collectionName: 'voteUsers',
        owner: true,
    },
    {
        id: '5',
        nickname: 'User5',
        active: true,
        hasVoted: true,
        observer: true,
        room: '123',
        collectionId: '123',
        collectionName: 'voteUsers',
        owner: true,
    },
];

vi.mock('~/lib/backend/client', () => ({
    backendClient: {
        collection: vi.fn(() => {
            return {
                getFullList: vi.fn(() => Promise.resolve(mockUsers)),
            };
        }),
    },
}));

describe('getVoteResults', () => {
    it('should return correct total votes', async ({ expect }) => {
        const result = await getVoteResults();
        expect(result.total).toBe(4);
    });

    it('should return correct vote distribution', async ({ expect }) => {
        const result = await getVoteResults();
        expect(result.distribution).toEqual({ '13': 2, '21': 2 });
    });

    it('should return correct votes grouped by user', async ({ expect }) => {
        const result = await getVoteResults();
        expect(result.votesByUser).toEqual([
            { id: '1', nickname: 'User1', vote: '13' },
            { id: '2', nickname: 'User2', vote: '21' },
            { id: '3', nickname: 'User3', vote: '13' },
            { id: '4', nickname: 'User4', vote: '21' },
        ]);
    });

    it('should return correct average vote', async ({ expect }) => {
        const result = await getVoteResults();
        expect(result.average).toBe(17);
    });

    it('should return correct median vote', async ({ expect }) => {
        const result = await getVoteResults();
        expect(result.mediam).toBe(17);
    });
});
