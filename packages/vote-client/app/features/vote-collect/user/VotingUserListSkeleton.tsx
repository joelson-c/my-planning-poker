import { Skeleton } from '~/components/ui/skeleton';

export function VotingUserListSkeleton() {
    return (
        <div className="flex gap-2">
            <Skeleton className="flex-none h-10 w-10 rounded-full" />
            <Skeleton className="h-10 w-full" />
        </div>
    );
}
