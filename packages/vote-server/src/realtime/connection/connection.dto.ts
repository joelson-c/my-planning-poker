import { IsString, IsUUID, Length } from 'class-validator';

export class ConnectionDto {
    @IsString()
    @Length(1, 16)
    nickname: string;

    @IsUUID()
    votingRoomId: string;
}
