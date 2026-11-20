import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RowScope } from '../middleware/row-scope.middleware';

export const GetRowScope = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): RowScope | undefined => {
    const request = ctx.switchToHttp().getRequest();
    return request.rowScope;
  },
);