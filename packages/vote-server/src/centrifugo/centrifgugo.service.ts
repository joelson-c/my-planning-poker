import type {
    CentrifugoPublishData,
    CentrifugoPublishOptions,
    CentrifugoPublishResult,
} from './interfaces';
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, map } from 'rxjs';

@Injectable()
export class CentrifugoService {
    constructor(private readonly httpService: HttpService) {}

    async publish<TPayload>(
        channel: string,
        payload: TPayload,
        options?: CentrifugoPublishOptions,
    ) {
        const response = this.httpService.post<
            CentrifugoPublishResult,
            CentrifugoPublishData<TPayload>
        >('publish', {
            ...options,
            channel: channel,
            data: payload,
        });

        return firstValueFrom(response.pipe(map((response) => response.data)));
    }
}
