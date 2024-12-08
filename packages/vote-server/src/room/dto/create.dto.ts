import { CardTypes } from '@planningpoker/domain-models';
import { IsIn, IsOptional } from 'class-validator';

export class CreateRoomDto {
    @IsIn([CardTypes.FIBONACCI, CardTypes.SIZES])
    @IsOptional()
    cardType?: CardTypes;
}
