import { Module } from '@nestjs/common';
import { ConfigurableModuleClass } from './centrifugo.module-definition';
import { CentrifugoService } from './centrifgugo.service';

@Module({
    providers: [CentrifugoService],
    exports: [CentrifugoService],
})
export class CentrifugoModule extends ConfigurableModuleClass {}
