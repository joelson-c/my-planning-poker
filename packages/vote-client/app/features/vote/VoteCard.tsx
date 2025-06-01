import { Separator } from '@radix-ui/react-separator';
import { Card, CardContent } from '~/components/ui/card';
import { VotingCardList } from './card/VotingCardList';

interface VoteCardProps {
    onVote: (vote: string) => void;
    currentVote?: string;
    isObserver?: boolean;
}

export function VoteCard({ onVote, currentVote, isObserver }: VoteCardProps) {
    return (
        <Card>
            <CardContent className="p-6 lg:p-8">
                <VotingCardList
                    onVote={onVote}
                    currentVote={currentVote}
                    disabled={isObserver}
                />
                <Separator className="my-6" />
            </CardContent>
        </Card>
    );
}
