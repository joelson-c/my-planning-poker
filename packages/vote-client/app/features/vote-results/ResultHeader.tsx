import type { Room } from '~/types/room';
import { ArrowLeft } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { useFetcher } from 'react-router';

interface ResultHeaderProps {
    room: Room;
}

export function ResultHeader({ room }: ResultHeaderProps) {
    const fetcher = useFetcher();

    return (
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Voting Results</h1>
            <fetcher.Form action={`/room/${room.id}/reset`} method="POST">
                <Button
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    type="submit"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Start New Vote
                </Button>
            </fetcher.Form>
        </div>
    );
}
