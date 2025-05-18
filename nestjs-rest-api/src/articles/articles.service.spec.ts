import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { ArticlesService } from './articles.service';
import { Article } from './article.entity';

describe('ArticlesService', () => {
  let service: ArticlesService;
  let repo: Partial<Record<keyof Repository<Article>, jest.Mock>>;
  let cache: Record<'get' | 'set' | 'reset', jest.Mock>;

  beforeEach(async () => {
    repo = {
      create: jest.fn(),
      save: jest.fn(),
      createQueryBuilder: jest.fn(),
      findOne: jest.fn(),
      delete: jest.fn(),
    };
    cache = {
      get: jest.fn(),
      set: jest.fn(),
      reset: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArticlesService,
        { provide: getRepositoryToken(Article), useValue: repo },
        { provide: CACHE_MANAGER, useValue: cache },
      ],
    }).compile();

    service = module.get<ArticlesService>(ArticlesService);
  });

  it('createArticle: should save and reset cache', async () => {
    const dto = { title: 'T', description: 'D', publishedDate: new Date() } as any;
    const user = { id: 1 } as any;
    const art = { id: 1, ...dto, author: user } as Article;
    repo.create.mockReturnValue(art);
    repo.save.mockResolvedValue(art);
    cache.reset.mockResolvedValue(undefined);

    const res = await service.createArticle(dto, user);
    expect(repo.create).toHaveBeenCalledWith({ ...dto, author: user });
    expect(repo.save).toHaveBeenCalledWith(art);
    expect(cache.reset).toHaveBeenCalled();
    expect(res).toEqual(art);
  });

  it('getArticles: return cached if exists', async () => {
    const arr = [{ id: 1 }] as Article[];
    cache.get.mockResolvedValue(arr);
    const res = await service.getArticles({} as any);
    expect(cache.get).toHaveBeenCalled();
    expect(res).toEqual(arr);
  });

  it('getArticles: query and cache when not cached', async () => {
    cache.get.mockResolvedValue(undefined);
    const arr = [{ id: 2 }] as Article[];
    const qb: any = {
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      innerJoin: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue(arr),
    };
    repo.createQueryBuilder.mockReturnValue(qb);

    const filter = { author: 'u', dateFrom: 'a', dateTo: 'b', limit: 5, offset: 0 } as any;
    const res = await service.getArticles(filter);
    expect(repo.createQueryBuilder).toHaveBeenCalledWith('article');
    expect(qb.getMany).toHaveBeenCalled();
    expect(cache.set).toHaveBeenCalledWith(expect.any(String), arr);
    expect(res).toEqual(arr);
  });

  it('getArticleById: return cached if exists', async () => {
    const art = { id: 3 } as Article;
    cache.get.mockResolvedValue(art);
    const res = await service.getArticleById(3);
    expect(cache.get).toHaveBeenCalledWith('article:3');
    expect(res).toEqual(art);
  });

  it('getArticleById: throw if not found', async () => {
    cache.get.mockResolvedValue(undefined);
    repo.findOne.mockResolvedValue(null);
    await expect(service.getArticleById(5)).rejects.toThrow(NotFoundException);
  });

  it('getArticleById: fetch and set cache when not cached', async () => {
    cache.get.mockResolvedValue(undefined);
    const art = { id: 4 } as Article;
    repo.findOne.mockResolvedValue(art);
    const res = await service.getArticleById(4);
    expect(repo.findOne).toHaveBeenCalledWith({ where: { id: 4 } });
    expect(cache.set).toHaveBeenCalledWith('article:4', art);
    expect(res).toEqual(art);
  });

  it('updateArticle: throw if unauthorized', async () => {
    jest.spyOn(service, 'getArticleById').mockResolvedValue({ author: { id: 2 } } as any);
    await expect(service.updateArticle(1, {} as any, { id: 1 } as any)).rejects.toThrow(UnauthorizedException);
  });

  it('updateArticle: save and reset cache if authorized', async () => {
    const orig = { id: 1, author: { id: 1 }, title: 'o' } as any;
    jest.spyOn(service, 'getArticleById').mockResolvedValue(orig);
    repo.save.mockResolvedValue({ ...orig, title: 'n' });
    cache.reset.mockResolvedValue(undefined);
    const res = await service.updateArticle(1, { title: 'n' } as any, { id: 1 } as any);
    expect(repo.save).toHaveBeenCalledWith(expect.objectContaining({ title: 'n' }));
    expect(cache.reset).toHaveBeenCalled();
    expect(res.title).toBe('n');
  });

  it('deleteArticle: throw if none deleted', async () => {
    repo.delete.mockResolvedValue({ affected: 0 } as any);
    await expect(service.deleteArticle(1, { id: 1 } as any)).rejects.toThrow(NotFoundException);
  });

  it('deleteArticle: delete and reset cache', async () => {
    repo.delete.mockResolvedValue({ affected: 1 } as any);
    cache.reset.mockResolvedValue(undefined);
    await service.deleteArticle(1, { id: 1 } as any);
    expect(cache.reset).toHaveBeenCalled();
  });
});
