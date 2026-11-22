import { Injectable, NestMiddleware } from "@nestjs/common";
import { randomUUID } from "crypto";

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    const requestId = (req.headers && req.headers["x-request-id"]) || randomUUID();
    req.requestId = requestId;

    if (typeof res.setHeader === "function") {
      res.setHeader("X-Request-Id", requestId);
    } else if (typeof res.header === "function") {
      res.header("X-Request-Id", requestId);
    }

    next();
  }
}
