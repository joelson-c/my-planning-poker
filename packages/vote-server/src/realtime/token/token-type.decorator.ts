import { SetMetadata } from '@nestjs/common';
import { Connection } from '../connection/connection.interface';
import { Subscription } from '../subscription/subscription.interface';

export const AUTH_TOKEN_TYPE = 'token-type';

export type RequiredTokenType = 'connection' | 'subscription';
export type AuthToken<T extends RequiredTokenType> = T extends 'connection'
    ? Connection
    : Subscription;

export const TokenType = (requiredTokenType: RequiredTokenType) =>
    SetMetadata(AUTH_TOKEN_TYPE, requiredTokenType);
