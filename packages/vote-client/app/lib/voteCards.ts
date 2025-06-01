import type { CardType } from '~/types/room';

export function getCardsForVariant(variant: CardType): string[] {
    switch (variant) {
        case 'FIBONACCI':
            return ['0', '1', '2', '3', '5', '8', '13', '21', '34', '55', '89'];

        case 'SIZES':
            return ['S', 'M', 'L', 'XL'];

        default:
            throw new Error(`Invalid card variant: ${variant}`);
    }
}
