import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '../users/user.entity';

export const GetUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): User => {
    const req = ctx.switchToHttp().getRequest();
    return req.user;
  },
);
