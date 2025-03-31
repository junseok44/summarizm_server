import {
  IsEnum,
  IsNotEmpty,
  IsString,
  IsUrl,
  ValidateNested,
  IsOptional,
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ChannelType } from 'src/output-channel/types/channel-type';
import { SummaryMode } from 'src/summary-processor/types/summary-mode.type';

// Custom decorator for channel config validation
export function IsValidChannelConfig(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isValidChannelConfig',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const obj = args.object as OutputChannelDto;

          if (obj.type === ChannelType.SLACK) {
            return (
              value &&
              typeof value.threadTs === 'string' &&
              typeof value.channelId === 'string'
            );
          }

          if (obj.type === ChannelType.FILE) {
            return value && typeof value.fileName === 'string';
          }

          return false;
        },
        defaultMessage(args: ValidationArguments) {
          const obj = args.object as OutputChannelDto;
          if (obj.type === ChannelType.SLACK) {
            return 'Slack 설정은 threadTs와 channelId가 필요합니다';
          }
          return '파일 설정은 fileName이 필요합니다';
        },
      },
    });
  };
}

// Slack 설정 DTO
class SlackConfig {
  @IsString()
  @IsNotEmpty()
  threadTs: string;

  @IsString()
  @IsNotEmpty()
  channelId: string;
}

// 파일 설정 DTO
class FileConfig {
  @IsString()
  @IsNotEmpty()
  fileName: string;
}

class OutputChannelDto {
  @IsEnum(ChannelType)
  @IsNotEmpty()
  type: ChannelType;

  @ValidateNested()
  @IsValidChannelConfig()
  @Type((options) => {
    const object = options?.object as OutputChannelDto;
    return object?.type === ChannelType.SLACK ? SlackConfig : FileConfig;
  })
  config: SlackConfig | FileConfig;
}

export class CreateSummaryDto {
  @IsString()
  @IsUrl()
  @IsNotEmpty()
  url: string;

  @IsEnum(SummaryMode)
  @IsOptional()
  mode?: SummaryMode = SummaryMode.FAST;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OutputChannelDto)
  outputChannels?: OutputChannelDto[];
}
