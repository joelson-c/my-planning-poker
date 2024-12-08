import Joi from 'joi';
import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';

const envSchema = Joi.object({
    REALTIME_JWT_PRIVATE_KEY: Joi.string().required(),
    AUTH_JWT_PRIVATE_KEY: Joi.string().required(),
    AUTH_JWT_PUBLIC_KEY: Joi.string().required(),
    DATABASE_URL: Joi.string().required(),
    CENTRIFUGO_API_ENDPOINT: Joi.string().required(),
    CENTRIFUGO_API_KEY: Joi.string().required(),
});

@Global()
@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            validationSchema: envSchema,
        }),
        ScheduleModule.forRoot(),
        EventEmitterModule.forRoot(),
    ],
    exports: [ConfigModule, ScheduleModule],
})
export class CoreModule {}
