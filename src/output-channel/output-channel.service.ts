import { Injectable } from '@nestjs/common';
import { FileSystemChannel } from './channels/file-system.channel';

import {
  IOutputChannel,
  ISendData,
} from './interfaces/output-channel.interface';
import { ChannelType } from './types/channel-type';
import { SlackChannel } from './channels/slack.channel';

@Injectable()
export class OutputChannelService {
  private channels: Map<ChannelType, IOutputChannel<ChannelType>>;

  constructor(
    private readonly fileSystemChannel: FileSystemChannel,
    private readonly slackChannel: SlackChannel,
  ) {
    this.channels = new Map<ChannelType, IOutputChannel<ChannelType>>([
      [ChannelType.FILE, fileSystemChannel],
      [ChannelType.SLACK, slackChannel],
    ]);
  }

  async send(data: ISendData<ChannelType>) {
    const channel = this.channels.get(data.type);
    if (!channel) throw new Error('지원하지 않는 출력 채널입니다.');
    return channel.send(data);
  }
}
