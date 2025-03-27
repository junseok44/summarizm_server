import { forwardRef, Module } from '@nestjs/common';
import { OutputChannelModule } from 'src/output-channel/output-channel.module';
import { SummaryProcessorModule } from 'src/summary-processor/summary-processor.module';
import { VideoSourceModule } from 'src/video-source/video-source.module';
import { SummaryController } from './summary.controller';
import { SummaryService } from './summary.service';

@Module({
  imports: [
    VideoSourceModule,
    OutputChannelModule,
    SummaryProcessorModule,
    forwardRef(() => OutputChannelModule),
  ],
  controllers: [SummaryController],
  providers: [SummaryService],
  exports: [SummaryService],
})
export class SummaryModule {}
