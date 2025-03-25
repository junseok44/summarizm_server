import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { YoutubeTranscriptService } from './services/youtube-transcript.service';
import { YoutubeService } from './services/youtube.service';

@Module({
  imports: [ConfigModule],
  providers: [YoutubeService, YoutubeTranscriptService],
  exports: [YoutubeService],
})
export class VideoSourceModule {}
