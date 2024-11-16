export interface Subscription {
    sub: string;
    aud: string;
    iss: string;
    channel: string;
    info: { nickname: string; isObserver: boolean };
}
