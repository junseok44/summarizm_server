import { Controller, Post, Body, Logger } from '@nestjs/common';
import { SummaryService } from '../summary/summary.service';
import { SlackConfig } from './interfaces/output-channel.interface';
import { OutputChannelService } from './output-channel.service';
import { ChannelType } from './types/channel-type';

@Controller('slack')
export class SlackController {
  private readonly logger = new Logger('SlackController');

  constructor(
    private readonly summaryService: SummaryService,
    private readonly outputChannelService: OutputChannelService,
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

    const slackConfig: SlackConfig = {
      threadTs: event.thread_ts || event.ts,
      channelId: event.channel,
    };

    try {
      this.outputChannelService
        .send({
          type: ChannelType.SLACK,
          config: slackConfig,
          content: {
            message: '요약을 준비하는 중이에요!!',
          },
        })
        .catch((error) => {
          this.logger.error('채널 전송 중 오류:', error);
        });

      // 요약 생성
      this.summaryService
        .create({
          url: event.text,
          outputChannels: [
            {
              type: ChannelType.SLACK,
              config: slackConfig,
            },
          ],
        })
        .catch((error) => {
          this.logger.error('요약 생성 중 오류:', error);

          const errorMessage = [
            '😅 앗! 요약하는 중에 문제가 생겼어요.',
            '',
            '🚨 *에러 내용*',
            `\`${error.message}\``,
            '',
            '🔄 다시 한 번 시도해주시겠어요?',
            '혹시 계속 같은 문제가 발생한다면 관리자에게 문의해주세요!',
          ].join('\n');

          this.outputChannelService.send({
            type: ChannelType.SLACK,
            config: slackConfig,
            content: {
              message: errorMessage,
            },
          });
        });

      return { message: 'Processing started' };
    } catch (error) {
      this.logger.error('Slack 이벤트 처리 중 오류:', error);

      return { message: 'Processing failed' };
    }
  }
}
