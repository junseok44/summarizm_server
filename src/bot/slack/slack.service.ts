import { Injectable, Logger } from '@nestjs/common';
import { SummaryMode } from 'src/summary-processor/types/summary-mode.type';
import { SummaryService } from 'src/summary/summary.service';
import { SlackConfig } from '../../output-channel/interfaces/output-channel.interface';
import { OutputChannelService } from '../../output-channel/output-channel.service';
import { ChannelType } from '../../output-channel/types/channel-type';
import { MODE_CONFIG_CLAUDE } from 'src/summary-processor/agents/claude/claude-mode.config';

@Injectable()
export class SlackService {
  private readonly logger = new Logger(SlackService.name);

  constructor(
    private readonly summaryService: SummaryService,
    private readonly outputChannelService: OutputChannelService,
  ) {}

  private parseMessage(text: string) {
    const modeMatch = text.match(/--mode=(\w+)/);
    const urlMatch = text.match(/https?:\/\/[^\s]+/);
    const inputMode = modeMatch?.[1] as SummaryMode;

    return {
      url: urlMatch?.[0],
      mode: Object.values(SummaryMode).includes(inputMode)
        ? inputMode
        : SummaryMode.FAST,
    };
  }

  private async sendMessage(config: SlackConfig, message: string) {
    await this.outputChannelService.send({
      type: ChannelType.SLACK,
      config,
      content: { message },
    });
  }

  private getModeConfig() {
    return MODE_CONFIG_CLAUDE;
  }

  private getHelpMessage(): string {
    return [
      '🎥 YouTube URL을 함께 보내주세요!',
      '',
      '💡 *요약 모드*',
      ...Object.entries(this.getModeConfig()).map(
        ([mode, config]) =>
          `• \`--mode=${mode}\` - ${config.emoji} ${config.description}`,
      ),
      '',
      '예시: @bot https://youtube.com/... --mode=fast',
    ].join('\n');
  }

  async handleEvent(event: any) {
    const slackConfig: SlackConfig = {
      threadTs: event.thread_ts || event.ts,
      channelId: event.channel,
    };

    const { url, mode } = this.parseMessage(event.text);

    if (!url) {
      await this.sendMessage(slackConfig, this.getHelpMessage());
      return;
    }

    const config = this.getModeConfig()[mode];

    await this.sendMessage(
      slackConfig,
      `${config.emoji} ${config.description} 모드로 요약을 시작할게요!`,
    );

    try {
      await this.summaryService.create({
        url,
        mode,
        outputChannels: [
          {
            type: ChannelType.SLACK,
            config: slackConfig,
          },
        ],
      });
    } catch (error) {
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

      await this.sendMessage(slackConfig, errorMessage);
    }
  }
}
