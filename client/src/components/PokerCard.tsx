import { motion } from "framer-motion";

export type PokerCardsProps = {
    value: string;
    isActive?: boolean;
    onVote?: (value: string) => void;
}

export default function PokerCard({ value, isActive, onVote }: PokerCardsProps) {
    return (
        <motion.button
            type='button'
            value={value}
            onClick={() => onVote && onVote(value)}
            whileTap={{ scale: 1.1, y: -8 }}
            className={`relative text-black rounded-sm w-28 h-36 ` +
                `${isActive ? 'bg-blue-300' : 'bg-white/80'}`}
        >
            <span
                className={'py-8 px-6 border border-black/30 rounded-sm before:absolute before:content-[attr(data-value)] before:top-0 before:left-2 ' +
                    'after:absolute after:content-[attr(data-value)] after:bottom-0 after:right-2'}
                data-value={value}
            >
                {value}
            </span>
        </motion.button>
    );
}
