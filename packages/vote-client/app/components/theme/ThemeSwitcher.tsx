import { Moon, Sun } from 'lucide-react';
import { Theme, useTheme } from '~/lib/useTheme';
import { Button } from '~/components/ui/button';

export function ThemeSwitcher() {
    const [theme, toggleTheme] = useTheme();

    return (
        <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {theme === Theme.DARK ? (
                <Moon className="h-6 w-6" />
            ) : (
                <Sun className="h-6 w-6" />
            )}
        </Button>
    );
}
