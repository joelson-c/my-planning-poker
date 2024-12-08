import type { VoteResult } from '@planningpoker/domain-models';
import { useMemo } from 'react';
import { Avatar, AvatarFallback } from '~/components/ui/avatar';
import { Card, CardHeader, CardTitle, CardContent } from '~/components/ui/card';

interface ResultIndividualVotesProps {
    votes: VoteResult;
}

export function ResultIndividualVotes({ votes }: ResultIndividualVotesProps) {
    const individualVotes = useMemo(() => {
        return Object.values(votes).filter(({ vote }) => !!vote);
    }, [votes]);

    return (
        <Card className="md:col-span-2">
            <CardHeader>
                <CardTitle>Individual Votes</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {individualVotes.map((user, index) => (
                        <div
                            key={index}
                            className="flex items-center space-x-4"
                        >
                            <Avatar>
                                <AvatarFallback>
                                    {user.nickname.slice(0, 1).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="text-sm font-medium">
                                    {user.nickname}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Voted: {user.vote}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
