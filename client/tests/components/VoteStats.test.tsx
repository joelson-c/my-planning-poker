import { getByText, render, screen } from '@testing-library/react';
import VoteStats from '../../src/components/VoteStats';
import { StoreState } from '../../src/state/rootStore';

vi.mock('../../src/state/rootStore', () => ({
    useRootStore: (callback: (state: Partial<StoreState>) => void) => {
        return callback({
            roomMeta: {
                hasRevealedCards: true,
                id: '1'
            },
            roomUsers: [
                {
                    userId: '1',
                    roomId: '1',
                    hasVoted: true,
                    votingValue: '2',
                    isModerator: true,
                    isObserver: false,
                    username: 'Test 1'
                },
                {
                    userId: '2',
                    roomId: '2',
                    hasVoted: true,
                    votingValue: '5',
                    isModerator: false,
                    isObserver: false,
                    username: 'Test 2'
                },
                {
                    userId: '3',
                    roomId: '3',
                    hasVoted: true,
                    votingValue: '5',
                    isModerator: false,
                    isObserver: false,
                    username: 'Test 3'
                },
                {
                    userId: '4',
                    roomId: '4',
                    hasVoted: true,
                    votingValue: undefined,
                    isModerator: false,
                    isObserver: false,
                    username: 'Test 4'
                },
                {
                    userId: '5',
                    roomId: '5',
                    hasVoted: true,
                    votingValue: '🙂',
                    isModerator: false,
                    isObserver: false,
                    username: 'Test 5'
                }
            ]
        });
    }
}));

beforeEach(() => {
    render(<VoteStats />);
});

test('shows the vote stats when the cards are revealed', () => {
    expect(screen.getByTestId('voting-majority')).toBeVisible();
    expect(screen.getByTestId('voting-average')).toBeVisible();
});

test('shows the voting average', () => {
    expect(screen.getByTestId('voting-average')).toHaveTextContent('4');
});

test('shows the voting majority', () => {
    expect(screen.getByTestId('voting-majority')).toHaveTextContent('5');
});

test('shows the voting grouped by value and their percentage', () => {
    const progressBars = screen.getAllByRole('progressbar');

    expect(progressBars).toHaveLength(3);

    const [votedTwo, votedFive, votedEmoji] = progressBars;

    expect(getByText(votedTwo, '2', { selector: 'span' })).toBeVisible();
    expect(votedTwo).toHaveAttribute('aria-valuetext', '25%');

    expect(getByText(votedFive, '5', { selector: 'span' })).toBeVisible();
    expect(votedFive).toHaveAttribute('aria-valuetext', '50%');

    expect(getByText(votedEmoji, '🙂', { selector: 'span' })).toBeVisible();
    expect(votedEmoji).toHaveAttribute('aria-valuetext', '25%');
});