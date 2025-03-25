import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { youtube_v3 } from '@googleapis/youtube';
import { Caption } from '../interfaces/caption.interface';
import axios from 'axios';
import { Buffer } from 'buffer';
import * as protobuf from 'protobufjs';

@Injectable()
export class YoutubeTranscriptService {
  private readonly youtubeClient: youtube_v3.Youtube;
  private readonly logger: Logger = new Logger('Youtube Transcript');

  constructor(private readonly configService: ConfigService) {
    this.youtubeClient = new youtube_v3.Youtube({
      auth: this.configService.get('YOUTUBE_DATA_API_KEY'),
    });
  }

  async extractTranscript(videoId: string): Promise<Caption[]> {
    const languages = ['ko', 'en', 'jp'];

    for (const lang of languages) {
      try {
        // 1. 기본 자막 정보 가져오기
        const { language, trackKind } =
          await this.getDefaultSubtitleInfo(videoId);

        // 2. 자막 추출
        const transcripts = await this.fetchTranscript({
          videoId,
          language,
          trackKind,
        });

        if (transcripts && transcripts.length > 0) {
          return transcripts.map((caption) => ({
            start: caption.start,
            dur: caption.dur,
            text: caption.text.replace(/<[^>]+>/g, ''),
          }));
        }
      } catch (error) {
        this.logger.warn(`${lang} 자막 추출 실패:`, error.message);
        continue;
      }
    }

    this.logger.error('사용 가능한 자막을 찾을 수 없습니다.');

    throw new NotFoundException('사용 가능한 자막을 찾을 수 없습니다.');
  }

  private async getDefaultSubtitleInfo(
    videoId: string,
  ): Promise<{ language: string; trackKind: string }> {
    const videos = await this.youtubeClient.videos.list({
      part: ['snippet'],
      id: [videoId],
    });

    if (!videos.data.items?.[0]) {
      throw new Error(`비디오를 찾을 수 없습니다: ${videoId}`);
    }

    const preferredLanguage =
      videos.data.items[0].snippet?.defaultLanguage ||
      videos.data.items[0].snippet?.defaultAudioLanguage;

    const subtitles = await this.youtubeClient.captions.list({
      part: ['snippet'],
      videoId: videoId,
    });

    if (!subtitles.data.items?.[0]) {
      throw new Error(`자막을 찾을 수 없습니다: ${videoId}`);
    }

    const { trackKind, language } =
      subtitles.data.items.find(
        (sub) => sub.snippet?.language === preferredLanguage,
      )?.snippet || subtitles.data.items[0].snippet;

    return { trackKind, language };
  }

  private async fetchTranscript({
    videoId,
    language,
    trackKind,
  }: {
    videoId: string;
    language: string;
    trackKind: string;
  }): Promise<Caption[]> {
    const message = {
      param1: videoId,
      param2: this.getBase64Protobuf({
        param1: trackKind === 'asr' ? trackKind : null,
        param2: language,
      }),
    };

    const params = this.getBase64Protobuf(message);

    const response = await axios.post(
      'https://www.youtube.com/youtubei/v1/get_transcript',
      {
        context: {
          client: {
            clientName: 'WEB',
            clientVersion: '2.20240826.01.00',
          },
        },
        params,
      },
      {
        headers: { 'Content-Type': 'application/json' },
      },
    );

    const initialSegments =
      response.data.actions[0].updateEngagementPanelAction.content
        .transcriptRenderer.content.transcriptSearchPanelRenderer.body
        .transcriptSegmentListRenderer.initialSegments;

    if (!initialSegments) {
      throw new Error(`자막을 찾을 수 없습니다: ${videoId}`);
    }

    return initialSegments.map((segment) => {
      const line =
        segment.transcriptSectionHeaderRenderer ||
        segment.transcriptSegmentRenderer;
      const { endMs, startMs, snippet } = line;

      return {
        start: parseInt(startMs) / 1000,
        dur: (parseInt(endMs) - parseInt(startMs)) / 1000,
        text: this.extractText(snippet),
      };
    });
  }

  private getBase64Protobuf(message: Record<string, any>): string {
    const root = protobuf.Root.fromJSON({
      nested: {
        Message: {
          fields: {
            param1: { id: 1, type: 'string' },
            param2: { id: 2, type: 'string' },
          },
        },
      },
    });
    const MessageType = root.lookupType('Message');
    const buffer = MessageType.encode(message).finish();
    return Buffer.from(buffer).toString('base64');
  }

  private extractText(item: any): string {
    return (
      item.simpleText ||
      item.runs?.map((run: { text: string }) => run.text).join('')
    );
  }
}
