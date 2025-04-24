import { Separator } from '~/components/ui/separator';
import { Skeleton } from '~/components/ui/skeleton';

export function VotingCardSkeleton() {
    return (
        <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 lg:gap-4">
                {[...Array(10)].map((_, i) => (
                    <Skeleton key={i} className="h-16 lg:h-20 w-full" />
                ))}
            </div>
            <Separator className="my-6" />
            <Skeleton className="h-10 w-full" />
        </>
    );
}
