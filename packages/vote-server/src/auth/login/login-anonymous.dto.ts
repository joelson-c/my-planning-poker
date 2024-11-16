import { IsString, Length } from 'class-validator';

export class LoginAnonymousDto {
    @IsString()
    @Length(1, 16)
    nickname: string;
}
