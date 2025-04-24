import { Avatar, AvatarFallback } from '~/components/ui/avatar';
import { Card, CardHeader, CardTitle, CardContent } from '~/components/ui/card';
import type { IndividualVote } from '~/lib/realtimeWorker/messages';

interface IndividualVotesProps {
    votes: IndividualVote[];
}

export function IndividualVotes({ votes }: IndividualVotesProps) {
    return (
        <section
            className="md:col-span-2"
            aria-labelledby="individual-votes-title"
        >
            <Card>
                <CardHeader>
                    <CardTitle id="individual-votes-title">
                        Individual Votes
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                        {votes.map(({ nickname, vote }) => (
                            <li
                                key={nickname + vote}
                                className="flex items-center space-x-4"
                                aria-label={`${nickname} voted: `}
                            >
                                <Avatar aria-hidden="true">
                                    <AvatarFallback>
                                        {nickname.slice(0, 1).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <span className="inline-flex flex-col gap-1">
                                    <span
                                        className="text-sm font-medium"
                                        aria-hidden="true"
                                    >
                                        {nickname}
                                    </span>
                                    <span className="text-sm text-muted-foreground">
                                        <span aria-hidden="true">Voted: </span>
                                        <span data-testid="individual-vote">
                                            {vote}
                                        </span>
                                    </span>
                                </span>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
        </section>
    );
}
