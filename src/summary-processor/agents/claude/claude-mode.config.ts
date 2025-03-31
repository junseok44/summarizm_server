import { SummaryMode, SummaryModeData } from '../../types/summary-mode.type';

export const MODE_CONFIG_CLAUDE: Record<SummaryMode, SummaryModeData> = {
  [SummaryMode.FAST]: {
    model: 'claude-3-5-haiku-20241022',
    maxTokens: 8000,
    description: '빠른 요약 (1분 이내)',
    emoji: '⚡️',
  },
  [SummaryMode.BALANCED]: {
    model: 'claude-3-7-sonnet-20250219',
    maxTokens: 8000,
    description: '균형잡힌 요약 (3분 이내)',
    emoji: '⚖️',
  },
  [SummaryMode.DETAILED]: {
    model: 'claude-3-opus-20240229',
    maxTokens: 8000,
    description: '상세 요약 (5분 이내)',
    emoji: '🔍',
  },
};
