import { Injectable, NestMiddleware } from "@nestjs/common";
import { FastifyRequest, FastifyReply } from "fastify";
import { randomUUID } from "crypto";

declare global {
  namespace FastifyRequest {
    interface FastifyRequest {
      requestId?: string;
    }
  }
}

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: FastifyRequest, res: FastifyReply, next: () => void) {
    const requestId = req.headers["x-request-id"] || randomUUID();
    req.requestId = requestId;
    res.header("X-Request-Id", requestId);
    next();
  }
}
