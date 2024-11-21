import { Module } from '@nestjs/common';
import { BroadcastService } from './broadcast.service';
import { CentrifugoModule } from 'src/centrifugo/centrifugo.module';

@Module({
    imports: [CentrifugoModule],
    providers: [BroadcastService],
    exports: [BroadcastService],
})
export class BroadcastModule {}
