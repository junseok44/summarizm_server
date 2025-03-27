import { Injectable, Logger } from '@nestjs/common';
import {
  IOutputChannel,
  ISendData,
} from '../interfaces/output-channel.interface';
import { ConfigService } from '@nestjs/config';

import * as path from 'path';
import * as fs from 'fs/promises';
import { ChannelType } from '../types/channel-type';

@Injectable()
export class FileSystemChannel implements IOutputChannel<ChannelType.FILE> {
  private readonly logger: Logger = new Logger('File System Channel'); // 로깅

  constructor(
    private readonly configService: ConfigService, // 설정 관리
  ) {}

  getName(): string {
    return 'file';
  }
  async getStatus(): Promise<boolean> {
    const storagePath = path.join(
      process.cwd(),
      this.configService.get('FILE_STORAGE_PATH'),
    );

    try {
      await fs.access(storagePath);
      return true;
    } catch {
      try {
        await fs.mkdir(storagePath, { recursive: true });
        return true;
      } catch (error) {
        this.logger.error(`저장소 생성 실패: ${error.message}`);
        return false;
      }
    }
  }

  async send(data: ISendData<ChannelType.FILE>): Promise<void> {
    const filePath = path.join(
      process.cwd(),
      this.configService.get('FILE_STORAGE_PATH'),
      data.config.fileName,
    );

    try {
      const content =
        typeof data.content === 'string'
          ? data.content
          : JSON.stringify(data.content, null, 2);

      await fs.writeFile(filePath, content);
      this.logger.log(`File saved: ${data.config.fileName}`);
    } catch (error) {
      this.logger.error(`Failed to save file: ${error.message}`);
      throw new Error('파일 저장 실패');
    }
  }
}
