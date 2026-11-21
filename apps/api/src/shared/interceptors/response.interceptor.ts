import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    return next.handle().pipe(
      map((data: any) => {
        // If data is already in standard format, return directly
        if (data && typeof data === "object" && "success" in data) {
          return data;
        }
        return {
          success: true,
          data,
          meta: {
            requestId: req.requestId || undefined,
            timestamp: new Date().toISOString(),
          },
        };
      }),
    );
  }
}
