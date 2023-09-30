import { Divider, Link } from "@nextui-org/react";

export default function Footer() {
    return (
        <footer className="mx-2">
            <Divider />
            <div className="flex gap-5 py-3 justify-center">
                <p>Feito com ❤️ do 🇧🇷 por&nbsp;
                    <Link href="https://github.com/joelson-c" target="_blank" rel="noopner">
                        @joelson-c
                    </Link>
                </p>
                <Divider orientation="vertical" />
                <Link
                    href="https://www.flaticon.com/free-icons/poker-cards"
                    rel="noopner"
                    target="_blank"
                    title="poker cards icons"
                >
                    Poker cards icons created by rizal2109 - Flaticon
                </Link>
            </div>
        </footer>
    );
}
