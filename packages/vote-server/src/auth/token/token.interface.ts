export interface Token {
    exp: number;
    sub: string;
    iss: 'voting_server';
    aud: 'login' | 'anon_login';
    nickname: string;
}
