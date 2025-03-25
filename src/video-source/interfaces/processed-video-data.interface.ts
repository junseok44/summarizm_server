import { Caption } from './caption.interface';

export interface ProcessedVideoData {
  title: string;
  description: string;
  videoId: string;
  transcript: Caption[];
}
