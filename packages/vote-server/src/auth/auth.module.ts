import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { UserModule } from 'src/user/user.module';
import { RoomModule } from 'src/room/room.module';
import { AuthController } from './auth.controller';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Module({
    imports: [
        UserModule,
        RoomModule,
        JwtModule.registerAsync({
            inject: [ConfigService],
            useFactory(configService: ConfigService) {
                return {
                    global: true,
                    privateKey: configService.get<string>(
                        'AUTH_JWT_PRIVATE_KEY',
                    ),
                    publicKey: configService.get<string>('AUTH_JWT_PUBLIC_KEY'),
                    verifyOptions: {
                        algorithms: ['RS256'],
                    },
                    signOptions: {
                        expiresIn: '1h',
                        algorithm: 'RS256',
                    },
                };
            },
        }),
    ],
    controllers: [AuthController],
    providers: [
        {
            provide: APP_GUARD,
            useClass: AuthGuard,
        },
        AuthService,
    ],
})
export class AuthModule {}
