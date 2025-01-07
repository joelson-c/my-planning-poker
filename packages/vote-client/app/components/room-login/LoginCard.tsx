import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '~/components/ui/card';
import { RepositoryLink } from '~/components/repository/link';
import type { ReactNode } from 'react';

interface LoginCardProps {
    isCreatingRoom?: string;
    children: ReactNode;
}

export function LoginCard({ isCreatingRoom, children }: LoginCardProps) {
    return (
        <div className="container mx-auto flex items-center justify-center min-h-screen p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center">
                        {isCreatingRoom
                            ? `Join Planning Poker Room`
                            : `Planning Poker`}
                    </CardTitle>
                    <CardDescription className="text-center">
                        Enter a nickname to join the session
                    </CardDescription>
                </CardHeader>
                <CardContent>{children}</CardContent>
                <CardFooter className="flex flex-col items-center space-y-4">
                    <div className="text-sm text-center text-muted-foreground">
                        This is an open-source project. Contribute or star us on
                        GitHub!
                    </div>
                    <RepositoryLink />
                </CardFooter>
            </Card>
        </div>
    );
}
