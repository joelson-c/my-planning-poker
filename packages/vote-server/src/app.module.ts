import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RoomModule } from './room/room.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { CoreModule } from './core/core.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { RealtimeModule } from './realtime/realtime.module';

@Module({
    imports: [
        CoreModule,
        AuthModule,
        RoomModule,
        UserModule,
        CoreModule,
        /* ThrottlerModule.forRoot([
            {
                ttl: 60000,
                limit: 10,
            },
        ]), */
        RealtimeModule,
    ],
    controllers: [AppController],
    providers: [
        AppService,
        /* {
            provide: APP_GUARD,
            useClass: ThrottlerGuard,
        }, */
    ],
})
export class AppModule {}
