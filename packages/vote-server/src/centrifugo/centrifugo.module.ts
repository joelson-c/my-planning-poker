import { Module } from '@nestjs/common';
import { CentrifugoService } from './centrifgugo.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

@Module({
    imports: [
        HttpModule.registerAsync({
            inject: [ConfigService],
            useFactory(configService: ConfigService) {
                return {
                    baseURL: configService.get<string>(
                        'CENTRIFUGO_API_ENDPOINT',
                    ),
                    headers: {
                        'X-API-Key':
                            configService.get<string>('CENTRIFUGO_API_KEY'),
                    },
                };
            },
        }),
    ],
    providers: [CentrifugoService],
    exports: [CentrifugoService],
})
export class CentrifugoModule {}
