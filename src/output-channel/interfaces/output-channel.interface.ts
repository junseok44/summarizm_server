import { ChannelType } from '../types/channel-type';

export interface SlackConfig {
  threadTs: string;
  channelId: string;
}

export interface FileConfig {
  fileName: string;
}

export interface ISendData<T extends ChannelType> {
  type: T;
  config: T extends 'slack' ? SlackConfig : FileConfig;
  content: any;
}

// 채널 인터페이스
export interface IOutputChannel<T extends ChannelType> {
  send(data: ISendData<T>): Promise<void>;
  getName(): string;
  getStatus(): Promise<boolean>;
}
