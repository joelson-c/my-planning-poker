import { json, type LoaderFunctionArgs } from '@remix-run/node';
import { RepositoryBanner } from '~/components/repository/banner';
import { ResultHeader } from './result/header';
import { ResultIndividualVotes } from './result/individualVotes';
import { ResultSummary } from './result/summary';
import { ResultVoteDistribution } from './result/voteDistribution';
import { getRoomVotes } from '~/lib/api/room';
import { refreshToken } from '~/lib/api/auth.server';
import { commitSession } from '~/lib/session';
import { useLoaderData } from '@remix-run/react';

export async function loader({ params, request }: LoaderFunctionArgs) {
    const { roomId } = params;
    if (!roomId) {
        throw new Response(null, { status: 404 });
    }

    const { token, session } = await refreshToken(request);
    const votes = await getRoomVotes(token, roomId);

    return json(
        {
            votes,
        },
        {
            headers: {
                'Set-Cookie': await commitSession(session),
            },
        },
    );
}

export default function Result() {
    const { votes } = useLoaderData<typeof loader>();

    return (
        <div className="container mx-auto p-4">
            <ResultHeader />
            <RepositoryBanner />
            <div className="grid gap-6 md:grid-cols-2">
                <ResultVoteDistribution votes={votes} />
                <ResultSummary votes={votes} />
                <ResultIndividualVotes votes={votes} />
            </div>
        </div>
    );
}
