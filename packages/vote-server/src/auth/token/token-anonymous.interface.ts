import { Token } from './token.interface';

export interface TokenAnonymous extends Token {
    aud: 'anon_login';
}
