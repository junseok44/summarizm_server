import { Injectable } from '@nestjs/common';
import { CreateSummaryDto } from './dto/create-summary.dto';
import { OutputChannelService } from 'src/output-channel/output-channel.service';
import { SummaryProcessorService } from 'src/summary-processor/summary-processor.service';
import { YoutubeService } from 'src/video-source/services/youtube.service';

@Injectable()
export class SummaryService {
  constructor(
    private readonly youtubeService: YoutubeService,
    private readonly outputChannelService: OutputChannelService,
    private readonly summaryProcessorService: SummaryProcessorService,
  ) {}

  async create(createSummaryDto: CreateSummaryDto) {
    const { url, outputChannels } = createSummaryDto;

    const videoData = await this.youtubeService.getVideoData(url);

    const summary = await this.summaryProcessorService.process(
      videoData.transcript,
      { title: videoData.title },
    );

    const content = {
      videoId: videoData.videoId,
      title: videoData.title,
      summary,
      createdAt: new Date(),
    };

    // 출력 채널로 전송
    if (outputChannels?.length) {
      outputChannels.map((channel) =>
        this.outputChannelService.send({
          type: channel.type,
          config: channel.config,
          content,
        }),
      );
    }

    return {
      videoId: videoData.videoId,
      title: videoData.title,
      summary,
      createdAt: new Date(),
    };
  }
}
