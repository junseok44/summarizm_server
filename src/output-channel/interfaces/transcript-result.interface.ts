import { SummaryResult } from 'src/summary-processor/interfaces/summary-result.interface';
import { Caption } from 'src/video-source/interfaces/caption.interface';

export interface TranscriptResult {
  videoId: string;
  title: string;
  summary: SummaryResult;
  transcript: Caption[];
  createdAt: Date;
}
