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
    const { url } = createSummaryDto;
    const videoData = await this.youtubeService.getVideoData(url);

    const summary = await this.summaryProcessorService.process(
      videoData.transcript,
      { title: videoData.title },
    );

    // 파일 저장
    await this.outputChannelService.send('file', {
      fileName: `${videoData.title}-${Date.now()}.json`,
      content: {
        videoId: videoData.videoId,
        title: videoData.title,
        summary,
        createdAt: new Date(),
      },
    });

    return {
      videoId: videoData.videoId,
      title: videoData.title,
      summary,
      createdAt: new Date(),
    };
  }
}
