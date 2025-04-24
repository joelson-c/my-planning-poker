import { Separator } from '@radix-ui/react-separator';
import { Card, CardContent } from '~/components/ui/card';
import { VotingCardList } from './card/VotingCardList';

interface VoteCardProps {
    onVote: (vote: string) => void;
    currentVote?: string;
}

export function VoteCard({ onVote, currentVote }: VoteCardProps) {
    return (
        <Card>
            <CardContent className="p-6 lg:p-8">
                <VotingCardList onVote={onVote} currentVote={currentVote} />
                <Separator className="my-6" />
            </CardContent>
        </Card>
    );
}
