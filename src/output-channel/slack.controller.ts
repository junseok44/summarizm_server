import { Controller, Post, Body, Logger } from '@nestjs/common';
import { SummaryService } from '../summary/summary.service';
import { ChannelType } from './types/channel-type';
import { SlackConfig } from './interfaces/output-channel.interface';
import { YoutubeService } from 'src/video-source/services/youtube.service';

@Controller('slack')
export class SlackController {
  private readonly logger = new Logger('SlackController');

  constructor(
    private readonly summaryService: SummaryService,
    private readonly youtubeService: YoutubeService,
  ) {}

  @Post('events')
  async handleSlackEvent(@Body() slackEvent: any) {
    // URL 검증 처리
    if (slackEvent.type === 'url_verification') {
      return { challenge: slackEvent.challenge };
    }

    const { event } = slackEvent;

    // 이벤트 타입 체크
    if (event.type !== 'app_mention') {
      return { message: 'Ignored event type' };
    }

    try {
      // YouTube URL 추출
      const youtubeUrl = this.youtubeService.extractVideoId(event.text);
      if (!youtubeUrl) {
        throw new Error('유효한 YouTube URL을 찾을 수 없습니다.');
      }

      const slackConfig: SlackConfig = {
        threadTs: event.thread_ts || event.ts,
        channelId: event.channel,
      };

      // 요약 생성
      await this.summaryService.create({
        url: youtubeUrl,
        outputChannels: [
          {
            type: ChannelType.SLACK,
            config: slackConfig,
          },
        ],
      });

      return { message: 'Processing started' };
    } catch (error) {
      this.logger.error('Slack 이벤트 처리 중 오류:', error);
      throw error;
    }
  }
}
