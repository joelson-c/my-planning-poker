import { Module } from '@nestjs/common';
import { BroadcastService } from './broadcast.service';
import { CentrifugoModule } from 'src/centrifugo/centrifugo.module';
import { ConfigService } from '@nestjs/config';

@Module({
    imports: [
        CentrifugoModule.registerAsync({
            inject: [ConfigService],
            useFactory(configService: ConfigService) {
                return {
                    centrifugoApiEndpoint: configService.get<string>(
                        'CENTRIFUGO_API_ENDPOINT',
                    ),
                    centrifugoApiKey:
                        configService.get<string>('CENTRIFUGO_API_KEY'),
                };
            },
        }),
    ],
    providers: [BroadcastService],
    exports: [BroadcastService],
})
export class BroadcastModule {}
