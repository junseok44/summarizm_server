import { SummaryResult } from 'src/summary-processor/interfaces/summary-result.interface';

export interface SummaryContent {
  videoId: string;
  title: string;
  summary: SummaryResult;
  createdAt: Date;
}
