import Joi from 'joi';
import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './prisma/prisma.service';
import { ScheduleModule } from '@nestjs/schedule';

const envSchema = Joi.object({
    REALTIME_JWT_PRIVATE_KEY: Joi.string().required(),
    AUTH_JWT_PRIVATE_KEY: Joi.string().required(),
});

@Global()
@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            validationSchema: envSchema,
        }),
        ScheduleModule.forRoot(),
    ],
    providers: [PrismaService],
    exports: [ConfigModule, PrismaService, ScheduleModule],
})
export class CoreModule {}
