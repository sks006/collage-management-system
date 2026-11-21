import { Injectable, NestInterceptor, ExecutionContext, CallHandler, HttpException, HttpStatus } from "@nestjs/common";
import { Observable, throwError } from "rxjs";
import { catchError } from "rxjs/operators";

@Injectable()
export class ErrorInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    return next.handle().pipe(
      catchError((error: any) => {
        const status = error instanceof HttpException ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
        const res = error instanceof HttpException ? error.getResponse() : null;

        const problemDetails = {
          type: "https://sms.school.local/errors/api-error",
          title: error.name || "Error",
          status,
          detail: error.message || "An unexpected error occurred",
          instance: req.url,
          request_id: req.requestId || undefined,
          errors: typeof res === "object" && res && "errors" in res ? (res as any).errors : undefined,
        };

        return throwError(() => new HttpException(problemDetails, status));
      }),
    );
  }
}
