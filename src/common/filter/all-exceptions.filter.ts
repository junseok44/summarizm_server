import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch() // 인자 없이 사용하면 모든 예외를 캐치
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorResponse: any = {
      error: 'INTERNAL_SERVER_ERROR',
      message: '서버 에러가 발생했습니다',
    };

    // HttpException인 경우
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      errorResponse = exception.getResponse();
    }
    // 일반 Error인 경우
    else if (exception instanceof Error) {
      errorResponse = {
        error: exception.name || 'Error',
        message: exception.message,
      };
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      ...errorResponse,
    });
  }
}
