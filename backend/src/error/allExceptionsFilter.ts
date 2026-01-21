import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ZodValidationException } from 'nestjs-zod';
import { ZodError } from 'zod';
import { QueryFailedError } from 'typeorm';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    // const request = ctx.getRequest<Request>();

    let status: number = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let customCode: number | null = null;
    const errors: any[] = [];

    console.error(exception);

    // 🟩 ZodValidationException (nestjs-zod)
    if (
      exception instanceof ZodValidationException ||
      exception instanceof ZodError
    ) {
      status = HttpStatus.BAD_REQUEST;
      customCode = 901;
      const zodError =
        exception instanceof ZodValidationException
          ? exception.getZodError()
          : exception;

      if (zodError instanceof ZodError) {
        const formattedErrors = zodError.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
        }));

        message = formattedErrors[0]?.message ?? 'Validation failed';
        errors.push(...formattedErrors);
      } else {
        message = 'Invalid request data';
      }

      // 🟩 TypeORM database errors
    } else if (exception instanceof QueryFailedError) {
      const err: any = exception;

      // Duplicate entry
      if (err.code === 'ER_DUP_ENTRY' || err.code === '23505') {
        status = HttpStatus.CONFLICT;
        customCode = 801;
        message = 'Duplicate entry';
        errors.push({ detail: err.message });

        // Foreign key constraint failure (MySQL)
      } else if (err.code === 'ER_NO_REFERENCED_ROW_2' || err.errno === 1452) {
        status = HttpStatus.BAD_REQUEST;
        customCode = 802; // custom code for FK errors
        message = 'Foreign key constraint failed';
        errors.push({ detail: err.message });
      } else {
        status = HttpStatus.BAD_REQUEST;
        message = err.message || 'Database error';
      }

      // 🟧 Nest built-in exceptions
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const responseBody = exception.getResponse();
      message =
        typeof responseBody === 'string'
          ? responseBody
          : (responseBody as any).message || message;

      if (typeof responseBody === 'object' && (responseBody as any).errors)
        errors.push(...(responseBody as any).errors);

      customCode = (responseBody as any)?.customCode || null;

      // 🟨 Generic Error
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    console.error({
      status,
      customCode,
      message,
      stack: exception instanceof Error ? exception.stack : null,
    });

    response.status(status).json({
      statusCode: customCode ?? status,
      message,
      errors,
    });
  }
}
