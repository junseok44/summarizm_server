import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import * as Joi from 'joi';
import { BotModule } from './bot/bot.module';
import { AllExceptionsFilter } from './common/filter/all-exceptions.filter';
import { SummaryModule } from './summary/summary.module';

@Module({
  imports: [
    SummaryModule,
    BotModule,
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        YOUTUBE_API_KEY: Joi.string().required(),
        CLAUDE_API_KEY: Joi.string().required(),
        FILE_STORAGE_PATH: Joi.string().required(),
      }),
    }),
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}
