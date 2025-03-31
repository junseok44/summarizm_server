import { Module } from '@nestjs/common';
import { SummaryProcessorService } from './summary-processor.service';
import { ClaudeAgentService } from './agents/claude/claude.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [HttpModule, ConfigModule],
  providers: [SummaryProcessorService, ClaudeAgentService],
  exports: [SummaryProcessorService],
})
export class SummaryProcessorModule {}
