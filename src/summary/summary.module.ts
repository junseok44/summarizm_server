import { Module } from '@nestjs/common';
import { OutputChannelModule } from 'src/output-channel/output-channel.module';
import { SummaryProcessorModule } from 'src/summary-processor/summary-processor.module';
import { VideoSourceModule } from 'src/video-source/video-source.module';
import { SummaryController } from './summary.controller';
import { SummaryService } from './summary.service';

@Module({
  imports: [VideoSourceModule, OutputChannelModule, SummaryProcessorModule],
  controllers: [SummaryController],
  providers: [SummaryService],
})
export class SummaryModule {}
