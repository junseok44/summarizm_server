import { OutputChannelModule } from 'src/output-channel/output-channel.module';
import { SummaryModule } from 'src/summary/summary.module';
import { SlackController } from './slack/slack.controller';
import { SlackService } from './slack/slack.service';
import { Module } from '@nestjs/common';

@Module({
  imports: [OutputChannelModule, SummaryModule],
  controllers: [SlackController],
  providers: [SlackService],
})
export class BotModule {}
