import { Injectable, Logger } from '@nestjs/common';
import { CreateSummaryDto } from './dto/create-summary.dto';
import { OutputChannelService } from 'src/output-channel/output-channel.service';
import { SummaryProcessorService } from 'src/summary-processor/summary-processor.service';
import { YoutubeService } from 'src/video-source/services/youtube.service';
import { SummaryContent } from './interfaces/summary-content.interface';

@Injectable()
export class SummaryService {
  private readonly logger: Logger = new Logger('SummaryService');

  constructor(
    private readonly youtubeService: YoutubeService,
    private readonly outputChannelService: OutputChannelService,
    private readonly summaryProcessorService: SummaryProcessorService,
  ) {}

  async create(createSummaryDto: CreateSummaryDto) {
    const { url, outputChannels, mode } = createSummaryDto;

    const videoData = await this.youtubeService.getVideoData(url);

    const summary = await this.summaryProcessorService.process(
      videoData.transcript,
      {
        type: 'claude',
        mode,
      },
    );

    const content: SummaryContent = {
      videoId: videoData.videoId,
      title: videoData.title,
      summary,
      createdAt: new Date(),
    };

    // 출력 채널로 전송
    if (outputChannels?.length) {
      Promise.all(
        outputChannels.map((channel) =>
          this.outputChannelService.send({
            type: channel.type,
            config: channel.config,
            content,
          }),
        ),
      ).catch((error) => {
        this.logger.error('채널 전송 중 오류:', error);
      });
    }

    return {
      videoId: videoData.videoId,
      title: videoData.title,
      summary,
      createdAt: new Date(),
    };
  }
}
