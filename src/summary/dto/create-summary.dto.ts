import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class CreateSummaryDto {
  @IsString()
  @IsUrl()
  @IsNotEmpty()
  url: string;
}
