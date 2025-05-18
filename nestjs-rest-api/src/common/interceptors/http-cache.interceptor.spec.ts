import { HttpCacheInterceptor } from './http-cache.interceptor';
import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

describe('HttpCacheInterceptor', () => {
  let interceptor: HttpCacheInterceptor;
  const reflector = new Reflector();
  const cacheManager = {} as any;

  beforeEach(() => {
    interceptor = new HttpCacheInterceptor(cacheManager, reflector);
    // mock httpAdapterHost for testing
    (interceptor as any).httpAdapterHost = {
      httpAdapter: {
        getRequestMethod: (req: any) => req.method,
        getRequestUrl: (req: any) => req.url,
      },
    };
  });

  it('should return undefined for non-GET', () => {
    const context = {
      switchToHttp: () => ({ getRequest: () => ({ method: 'POST', url: '/test' }) }),
      getHandler: () => {},
      getClass: () => {},
    } as any as ExecutionContext;
    const key = (interceptor as any).trackBy(context);
    expect(key).toBeUndefined();
  });

  it('should return path for GET', () => {
    const context = {
      switchToHttp: () => ({ getRequest: () => ({ method: 'GET', url: '/path' }) }),
      getHandler: () => {},
      getClass: () => {},
    } as any as ExecutionContext;
    const key = (interceptor as any).trackBy(context);
    expect(key).toContain('/path');
  });
});
