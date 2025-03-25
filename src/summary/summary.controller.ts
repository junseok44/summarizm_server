import { Body, Controller, Post } from '@nestjs/common';
import { CreateSummaryDto } from './dto/create-summary.dto';
import { SummaryService } from './summary.service';

@Controller('summary')
export class SummaryController {
  constructor(private readonly summaryService: SummaryService) {}

  @Post()
  create(@Body() createSummaryDto: CreateSummaryDto) {
    return this.summaryService.create(createSummaryDto);
  }
}
