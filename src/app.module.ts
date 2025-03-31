import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SummaryModule } from './summary/summary.module';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { APP_FILTER } from '@nestjs/core';
import { AllExceptionsFilter } from './common/filter/all-exceptions.filter';
import { BotModule } from './bot/bot.module';

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
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}
