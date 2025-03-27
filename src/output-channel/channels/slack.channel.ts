import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WebClient } from '@slack/web-api';
import {
  IOutputChannel,
  ISendData,
} from '../interfaces/output-channel.interface';
import { ChannelType } from '../types/channel-type';
import { SummaryContent } from 'src/summary/interfaces/summary-content.interface';

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
    const { threadTs, channelId } = data.config;

    try {
      const formattedContent = this.formatSummaryForSlack(data.content);

      await this.slackClient.chat.postMessage({
        channel: channelId,
        thread_ts: threadTs,
        text: formattedContent,
        parse: 'full',
      });

      this.logger.log(`Slack message sent to channel: ${channelId}`);
    } catch (error) {
      this.logger.error('Slack 메시지 전송 실패:', error);

      throw new Error('Slack 메시지 전송 실패');
    }
  }

  private formatSummaryForSlack(content: any): string {
    // 단순 텍스트인 경우
    if (typeof content === 'string' || content?.message) {
      return content.message || content;
    }

    const {
      title,
      summary: { mainTopics, totalSummary, timeline },
    } = content as SummaryContent;

    // Slack 메시지 포맷팅
    const message = [
      `🎉 요약이 완성되었어요!`,
      '',
      `📺 *${title}*`,
      '',
      '🎯 *주요 토픽*',
      mainTopics,
      '',
      '📝 *전체 요약*',
      ...totalSummary.map((summary) => `• ${summary}`),
      '',
      '⏱ *타임라인*',
      ...timeline
        .map((item) => [
          `${item.icon || '▶️'} *${item.startTime}* - ${item.title}`,
          ...item.summary.map((point) => `   • ${point}`),
          '', // 각 타임라인 항목 사이 빈 줄 추가
        ])
        .flat(),
      '',
      '🔍 더 자세한 내용이 궁금하시다면 타임라인의 시간을 클릭해서 해당 부분부터 시청해보세요!',
    ].join('\n');

    return message;
  }
}
