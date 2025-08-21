import {
	ExceptionFilter,
	Catch,
	ArgumentsHost,
	HttpException,
	HttpStatus,
	BadRequestException,
} from '@nestjs/common';
import { ValidationError } from 'class-validator';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
	catch(exception: unknown, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse();
		const request = ctx.getRequest();

		let status = HttpStatus.INTERNAL_SERVER_ERROR;
		let message: any = 'Internal server error';

		if (exception instanceof HttpException) {
			status = exception.getStatus();

			const res = exception.getResponse();
			
			if (res && typeof res === 'object' && 'message' in res) {
				message = res['message'];
			} else {
				message = exception.message;
			}
		}

		response.status(status).json({
			statusCode: status,
			timestamp: new Date().toISOString(),
			path: request.url,
			message,
		});
	}
}
