import { RepositoryBanner } from '~/components/repository/banner';
import { ResultHeader } from './result/header';
import { ResultIndividualVotes } from './result/individualVotes';
import { ResultSummary } from './result/summary';
import { ResultVoteDistribution } from './result/voteDistribution';

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
