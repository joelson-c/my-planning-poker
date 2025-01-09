import type { ReactNode } from 'react';
import { Card, CardContent } from '~/components/ui/card';

interface VotingUserItemProps {
    children: ReactNode;
}

export function VotingUserList({ children }: VotingUserItemProps) {
    return (
        <div className="w-full lg:w-1/3">
            <Card>
                <CardContent className="p-6">
                    <h2 className="text-xl font-semibold mb-4">
                        Users in Room
                    </h2>
                    <div className="space-y-4">{children}</div>
                </CardContent>
            </Card>
        </div>
    );
}
