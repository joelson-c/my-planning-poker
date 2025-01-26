import type { VoteResult } from '~/types/voteResult';
import { Avatar, AvatarFallback } from '~/components/ui/avatar';
import { Card, CardHeader, CardTitle, CardContent } from '~/components/ui/card';

interface ResultIndividualVotesProps {
    voteResult: VoteResult;
}

export function ResultIndividualVotes({
    voteResult: { votesByUser },
}: ResultIndividualVotesProps) {
    return (
        <Card className="md:col-span-2">
            <CardHeader>
                <CardTitle>Individual Votes</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {votesByUser.map(([nickname, vote]) => (
                        <div
                            key={nickname}
                            className="flex items-center space-x-4"
                        >
                            <Avatar>
                                <AvatarFallback>
                                    {nickname.slice(0, 1).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="text-sm font-medium">
                                    {nickname}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Voted: {vote}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
