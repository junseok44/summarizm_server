import { Module } from '@nestjs/common';
import { OutputChannelService } from './output-channel.service';
import { FileSystemChannel } from './channels/file-system.channel';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [ConfigModule, HttpModule],
  providers: [OutputChannelService, FileSystemChannel],
  exports: [OutputChannelService],
})
export class OutputChannelModule {}
