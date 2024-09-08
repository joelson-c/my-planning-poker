import { Tooltip } from "@nextui-org/react";
import { motion } from "framer-motion";

export type PokerCardsProps = {
    value: string;
    description?: string;
    isActive?: boolean;
    onVote?: (value: string) => void;
}

export default function PokerCard({ value, description, isActive, onVote }: PokerCardsProps) {
    return (
        <div>
            {description && (
                <Tooltip content={description}>
                    <h3 className='text-bold text-2xl w-min max-w-full truncate mx-auto mb-3'>{description}</h3>
                </Tooltip>
            )}
            <div className='relative w-full before:inline-block before:pb-[120%]'>
                <div className="absolute inset-0 flex flex-col items-center gap-3">
                    <motion.button
                        type='button'
                        value={value}
                        onClick={() => onVote && onVote(value)}
                        whileTap={{ scale: 1.1, y: -8 }}
                        className={`relative text-black rounded-sm w-full h-full ` +
                            `${isActive ? 'bg-blue-300' : 'bg-white/80'}`}
                    >
                        <span
                            className={'py-6 px-4 border border-black/30 rounded-sm font-bold text-lg ' +
                                'before:absolute before:content-[attr(data-value)] before:top-0 before:left-1 before:text-xs before:font-normal ' +
                                'after:absolute after:content-[attr(data-value)] after:bottom-0 after:right-1 after:text-xs after:font-normal'}
                            data-value={value}
                        >
                            {value}
                        </span>
                    </motion.button>
                </div>
            </div>
        </div>
    );
}
