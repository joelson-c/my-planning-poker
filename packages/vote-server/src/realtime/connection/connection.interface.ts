export interface Connection {
    // Returns user id
    sub: string;
    aud: 'connection';
    iss: 'voting_server';
}
