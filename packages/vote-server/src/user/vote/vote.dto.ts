import { IsNotEmpty } from 'class-validator';

export class VoteDto {
    @IsNotEmpty()
    value: string;
}
