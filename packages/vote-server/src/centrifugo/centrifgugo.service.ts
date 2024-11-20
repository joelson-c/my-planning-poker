import type { KyInstance } from 'ky';
import { Inject, Injectable } from '@nestjs/common';
import { MODULE_OPTIONS_TOKEN } from './centrifugo.module-definition';
import {
    CentrifugoModuleOptions,
    CentrifugoPublishOptions,
} from './interfaces';

@Injectable()
export class CentrifugoService {
    private readonly _httpClient: KyInstance;

    constructor(
        @Inject(MODULE_OPTIONS_TOKEN)
        private readonly options: CentrifugoModuleOptions,
    ) {}

    async publish<TPayload, TResponse = unknown>(
        channel: string,
        payload: TPayload,
        options?: CentrifugoPublishOptions,
    ) {
        const response = await (
            await this.getHttpClient()
        ).post<TResponse>('publish', {
            json: {
                ...options,
                channel: channel,
                data: payload,
            },
        });

        return response.json();
    }

    private async getHttpClient() {
        if (this._httpClient) {
            return this._httpClient;
        }

        const ky = (await import('ky')).default;
        return ky.create({
            prefixUrl: this.options.centrifugoApiEndpoint,
            headers: {
                'X-API-Key': this.options.centrifugoApiKey,
            },
        });
    }
}
