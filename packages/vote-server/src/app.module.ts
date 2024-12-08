import { Module } from '@nestjs/common';
import { RoomModule } from './room/room.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { CoreModule } from './core/core.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { RealtimeModule } from './realtime/realtime.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
    imports: [
        CoreModule,
        AuthModule,
        RoomModule,
        UserModule,
        /* ThrottlerModule.forRoot([
            {
                ttl: 60000,
                limit: 10,
            },
        ]), */
        RealtimeModule,
    ],
    providers: [
        /* {
            provide: APP_GUARD,
            useClass: ThrottlerGuard,
        }, */
    ],
})
export class AppModule {}
