export interface IOutputChannel {
  send(data: IStorageData): Promise<void>;
  getName(): string; // 채널 식별자
  getStatus(): Promise<boolean>; // 채널 상태 확인
}

export interface IStorageData {
  fileName: string;
  content: any;
}
