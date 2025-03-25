import { Injectable } from '@nestjs/common';
// import { DatabaseChannel } from './channels/database.channel';
import { FileSystemChannel } from './channels/file-system.channel';
// import { SlackChannel } from './channels/slack.channel';

import {
  IOutputChannel,
  IStorageData,
} from './interfaces/output-channel.interface';
import { ChannelType } from './types/channel-type';

@Injectable()
export class OutputChannelService {
  private channels: Map<ChannelType, IOutputChannel>;

  constructor(
    private readonly fileSystemChannel: FileSystemChannel,
    // private readonly databaseChannel: DatabaseChannel,
    // private readonly slackChannel: SlackChannel,
  ) {
    this.channels = new Map<ChannelType, IOutputChannel>([
      ['file', fileSystemChannel],
      // ['db', databaseChannel],
      // ['slack', slackChannel],
    ]);
  }

  async send(channelType: ChannelType, data: IStorageData) {
    const channel = this.channels.get(channelType);
    if (!channel) throw new Error('지원하지 않는 출력 채널입니다.');
    return channel.send(data);
  }
}
