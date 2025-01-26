import { Badge } from './ui/badge';

export function Header() {
    return (
        <header className="p-4 mb-4 bg-white dark:bg-gray-800 shadow">
            <div className="container mx-auto flex justify-between items-center">
                <h1 className="text-2xl font-bold">
                    Planning Poker
                    <Badge variant="outline">Beta</Badge>
                </h1>
            </div>
        </header>
    );
}
