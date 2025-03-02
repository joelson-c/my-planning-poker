import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from '~/components/ui/card';
import { RepositoryLink } from '~/components/repository/RepositoryLink';
import type { ReactNode } from 'react';
import { Separator } from '../ui/separator';

interface LoginCardProps {
    title: ReactNode;
    children: ReactNode;
}

export function LoginCard({ title, children }: LoginCardProps) {
    return (
        <section className="flex justify-center items-center h-[calc(100vh-96px)]">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center">
                        <h2>{title}</h2>
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                    {children}
                </CardContent>
                <CardFooter className="flex flex-col items-center space-y-4">
                    <Separator />
                    <div className="text-sm text-center text-muted-foreground">
                        This is an open-source project. Contribute or star us on
                        GitHub!
                    </div>
                    <RepositoryLink />
                </CardFooter>
            </Card>
        </section>
    );
}
