import { ConfigurableModuleBuilder } from '@nestjs/common';
import { CentrifugoModuleOptions } from './interfaces';

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } =
    new ConfigurableModuleBuilder<CentrifugoModuleOptions>().build();
