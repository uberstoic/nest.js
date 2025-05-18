import { Injectable, ExecutionContext, Inject, Logger } from '@nestjs/common';
import { CacheInterceptor, CACHE_MANAGER } from '@nestjs/cache-manager';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import type { Cache } from 'cache-manager';

@Injectable()
export class HttpCacheInterceptor extends CacheInterceptor {
  private readonly logger = new Logger(HttpCacheInterceptor.name);

  constructor(
    @Inject(CACHE_MANAGER) cacheManager: Cache,
    reflector: Reflector,
  ) {
    super(cacheManager, reflector);
  }

  protected trackBy(context: ExecutionContext): string | undefined {
    const request = context.switchToHttp().getRequest<Request>();
    if (request.method !== 'GET') {
      return undefined;
    }
    const url = (this.httpAdapterHost as any).httpAdapter.getRequestUrl(request as any);
    this.logger.debug(`Cache key: ${url}`);
    return url;
  }
}