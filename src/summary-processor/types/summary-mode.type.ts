export enum SummaryMode {
  FAST = 'fast', // 빠른 요약
  BALANCED = 'balanced', // 균형잡힌 요약
  DETAILED = 'detailed', // 상세 요약
}

export interface SummaryModeData {
  model: string;
  maxTokens: number;
  description: string;
  emoji: string;
}
