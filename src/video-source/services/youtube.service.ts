import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { google } from 'googleapis';
import { Caption } from '../interfaces/caption.interface';
import { ProcessedVideoData } from '../interfaces/processed-video-data.interface';
import { YoutubeTranscriptService } from './youtube-transcript.service';
import { VideoSource } from '../interfaces/video-sources';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class YoutubeService implements VideoSource {
  private readonly youtube = google.youtube('v3');

  constructor(
    private readonly youtubeTranscriptService: YoutubeTranscriptService,
    private readonly configService: ConfigService,
  ) {}

  async getVideoData(url: string): Promise<ProcessedVideoData> {
    // 1. URL에서 video ID 추출
    const videoId = this.extractVideoId(url);

    // 2. 비디오 정보 가져오기, 자막 추출
    const [videoInfo, transcript] = await Promise.all([
      this.getVideoMetadata(videoId),
      this.extractTranscript(videoId),
    ]);

    // 4. 데이터 구조화
    return {
      ...videoInfo,
      transcript,
    };
  }

  private async getVideoMetadata(videoId: string) {
    const response = await this.youtube.videos.list({
      key: this.configService.get('YOUTUBE_API_KEY'),
      part: ['snippet'],
      id: [videoId],
    });

    const video = response.data.items?.[0];

    if (!video) {
      throw new NotFoundException('영상을 찾을 수 없습니다.');
    }

    return {
      title: video.snippet?.title || '제목 없음',
      description: video.snippet?.description || '',
      videoId,
    };
  }

  private async extractTranscript(videoId: string): Promise<Caption[]> {
    return this.youtubeTranscriptService.extractTranscript(videoId);
  }

  extractVideoId(url: string): string {
    const regex = /(?:youtube\.com.*(?:\?|&)v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    if (match && match[1]) {
      return match[1];
    }

    throw new BadRequestException('유효한 YouTube URL이 아닙니다.');
  }
}
