export interface CentrifugoPublishOptions {
    idempotency_key?: string;
    delta?: boolean;
}

export interface CentrifugoPublishData<T> extends CentrifugoPublishOptions {
    channel: string;
    data: T;
}

export interface CentrifugoPublishResult {
    offset: number;
    epoch: string;
}
