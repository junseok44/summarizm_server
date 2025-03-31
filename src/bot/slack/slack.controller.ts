import { Body, Controller, Logger, Post } from '@nestjs/common';
import { SlackService } from './slack.service';

@Controller('bot/slack')
export class SlackController {
  private readonly logger = new Logger('SlackController');

  constructor(private readonly slackService: SlackService) {}

  @Post('events')
  async handleSlackEvent(@Body() slackEvent: any) {
    // URL 검증
    if (slackEvent.type === 'url_verification') {
      return { challenge: slackEvent.challenge };
    }

    // 이벤트 타입 체크
    if (slackEvent.event.type !== 'app_mention') {
      return { message: 'Ignored event type' };
    }

    // 서비스로 이벤트 처리 위임
    this.slackService.handleEvent(slackEvent.event).catch((error) => {
      this.logger.error('Slack 이벤트 처리 중 오류:', error);
    });

    return { message: 'Processing started' };
  }
}
