import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WebClient } from '@slack/web-api';
import {
  IOutputChannel,
  ISendData,
} from '../interfaces/output-channel.interface';
import { ChannelType } from '../types/channel-type';

@Injectable()
export class SlackChannel implements IOutputChannel<ChannelType.SLACK> {
  private readonly slackClient: WebClient;
  private readonly logger: Logger = new Logger('Slack Channel');

  constructor(private readonly configService: ConfigService) {
    const token = this.configService.get<string>('SLACK_BOT_TOKEN');
    this.slackClient = new WebClient(token);
  }

  getName(): string {
    return 'slack';
  }

  async getStatus(): Promise<boolean> {
    try {
      await this.slackClient.auth.test();
      return true;
    } catch (error) {
      this.logger.error('Slack 연결 실패:', error);
      return false;
    }
  }

  async send(data: ISendData<ChannelType.SLACK>): Promise<void> {
    try {
      const { threadTs, channelId } = data.config;
      const formattedContent = this.formatSummaryForSlack(data.content);

      await this.slackClient.chat.postMessage({
        channel: channelId,
        thread_ts: threadTs,
        text: formattedContent,
      });

      this.logger.log(`Slack message sent to channel: ${channelId}`);
    } catch (error) {
      this.logger.error('Slack 메시지 전송 실패:', error);
      throw new Error('Slack 메시지 전송 실패');
    }
  }

  private formatSummaryForSlack(content: any): string {
    const { title, summary } = content;
    return [
      `*${title}*`,
      '',
      '*요약:*',
      summary,
      '',
      `_${new Date().toLocaleString('ko-KR')}_`,
    ].join('\n');
  }
}
