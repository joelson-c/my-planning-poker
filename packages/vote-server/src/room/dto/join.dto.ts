import { IsBoolean, IsOptional } from 'class-validator';

export class JoinRoomDto {
    @IsBoolean()
    @IsOptional()
    isObserver?: boolean;
}
