import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';
import { IAIAgent } from 'src/summary-processor/interfaces/ai-agent.interface';
import { SummaryMode } from 'src/summary-processor/types/summary-mode.type';
import { MODE_CONFIG_CLAUDE } from './claude-mode.config';

@Injectable()
export class ClaudeAgentService implements IAIAgent {
  private readonly anthropic: Anthropic;
  private readonly logger: Logger = new Logger('Claude Agent');

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('CLAUDE_API_KEY');
    this.anthropic = new Anthropic({
      apiKey,
    });
  }

  getModelConfig() {
    return MODE_CONFIG_CLAUDE;
  }

  getName(): string {
    return 'Claude';
  }

  async request(
    systemPrompt: string,
    userPrompt: string,
    mode: SummaryMode,
  ): Promise<string> {
    try {
      const response = await this.anthropic.messages.create({
        model: this.getModelConfig()[mode].model,
        max_tokens: this.getModelConfig()[mode].maxTokens,
        temperature: 0,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userPrompt,
          },
        ],
      });

      // content 배열의 text 타입 항목들을 합침
      const result = response.content
        .map((item) => (item.type === 'text' ? item.text : ''))
        .join('');

      if (!result) {
        throw new Error('Claude API 응답이 올바르지 않습니다.');
      }

      return result;
    } catch (error) {
      this.logger.error('Claude API 호출 중 오류:', error);

      if (error.status === 529) {
        throw new Error(
          '클로드 서버가 과부화 상태입니다. 잠시 후 다시 시도해주세요.',
        );
      }

      throw new Error('AI 요청 중 오류가 발생했습니다.' + error.message);
    }
  }
}
