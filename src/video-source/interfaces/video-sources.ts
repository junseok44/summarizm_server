import { ProcessedVideoData } from './processed-video-data.interface';

export interface VideoSource {
  getVideoData(videoId: string): Promise<ProcessedVideoData>;
}
