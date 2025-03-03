import { Avatar, AvatarFallback } from '~/components/ui/avatar';
import { Card, CardHeader, CardTitle, CardContent } from '~/components/ui/card';
import { useVoteResultContext } from './context';

export function ResultIndividualVotes() {
    const { votesByUser } = useVoteResultContext();

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
                        {votesByUser.map(({ nickname, vote, id }) => (
                            <li
                                key={id}
                                className="flex items-center space-x-4"
                            >
                                <Avatar role="presentation">
                                    <AvatarFallback>
                                        {nickname.slice(0, 1).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <dl aria-label="Votes by user">
                                    <dt className="text-sm font-medium">
                                        {nickname}
                                    </dt>
                                    <dd className="text-sm text-muted-foreground">
                                        Voted: {vote}
                                    </dd>
                                </dl>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
        </section>
    );
}
