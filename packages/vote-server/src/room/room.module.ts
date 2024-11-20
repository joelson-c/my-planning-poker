import { Module } from '@nestjs/common';
import { RoomController } from './room.controller';
import { RoomService } from './room.service';
import { UserModule } from 'src/user/user.module';
import { BroadcastModule } from 'src/broadcast/broadcast.module';

@Module({
    imports: [UserModule, BroadcastModule],
    controllers: [RoomController],
    providers: [RoomService],
    exports: [RoomService],
})
export class RoomModule {}
