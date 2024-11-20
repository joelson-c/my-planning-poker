import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { RealtimeController } from './realtime.controller';
import { RealtimeService } from './realtime.service';
import { RoomModule } from 'src/room/room.module';
import { UserModule } from 'src/user/user.module';
import { BroadcastModule } from 'src/broadcast/broadcast.module';

@Module({
    imports: [
        JwtModule.registerAsync({
            inject: [ConfigService],
            useFactory(configService: ConfigService) {
                return {
                    global: true,
                    privateKey: configService.get<string>(
                        'REALTIME_JWT_PRIVATE_KEY',
                    ),
                    signOptions: {
                        expiresIn: '10m',
                        algorithm: 'RS256',
                    },
                };
            },
        }),
        RoomModule,
        UserModule,
        BroadcastModule,
    ],
    controllers: [RealtimeController],
    providers: [RealtimeService],
})
export class RealtimeModule {}
