import { SummaryMode, SummaryModeData } from '../types/summary-mode.type';

export interface IAIAgent {
  request(
    systemPrompt: string,
    userPrompt: string,
    mode: SummaryMode,
  ): Promise<string>;
  getName(): string;
  getModelConfig(): Record<SummaryMode, SummaryModeData>;
}
