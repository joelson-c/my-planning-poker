import type { ClientLoaderFunctionArgs } from '@remix-run/react';
import { RepositoryBanner } from '~/components/repository/banner';
import { ResultHeader } from '~/components/result/header';
import { ResultIndividualVotes } from '~/components/result/individualVotes';
import { ResultSummary } from '~/components/result/summary';
import { ResultVoteDistribution } from '~/components/result/voteDistribution';

export const clientLoader = async ({ params }: ClientLoaderFunctionArgs) => {
    if (!params.roomId) {
        throw new Response(null, {
            status: 403,
        });
    }

    // TODO: validate the room state

    return null;
};

export default function Result() {
    return (
        <div className="container mx-auto p-4">
            <ResultHeader />
            <RepositoryBanner />
            <div className="grid gap-6 md:grid-cols-2">
                <ResultVoteDistribution />
                <ResultSummary />
                <ResultIndividualVotes />
            </div>
        </div>
    );
}
