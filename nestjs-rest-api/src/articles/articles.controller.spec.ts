import { Test, TestingModule } from '@nestjs/testing';
import { ArticlesController } from './articles.controller';
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { GetArticlesFilterDto } from './dto/get-articles-filter.dto';
import { Article } from './article.entity';
import { User } from '../users/user.entity';
import { PassportModule } from '@nestjs/passport';

describe('ArticlesController', () => {
  let controller: ArticlesController;
  let service: Partial<Record<keyof ArticlesService, jest.Mock>>;
  let user: User;

  beforeEach(async () => {
    user = { id: 1 } as User;
    service = {
      createArticle: jest.fn(),
      getArticles: jest.fn(),
      getArticleById: jest.fn(),
      updateArticle: jest.fn(),
      deleteArticle: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
      controllers: [ArticlesController],
      providers: [{ provide: ArticlesService, useValue: service }],
    }).compile();

    controller = module.get<ArticlesController>(ArticlesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('createArticle returns article', async () => {
    const dto = { title: 't', description: 'd', publishedDate: new Date() } as CreateArticleDto;
    const article = { id: 1, ...dto, author: user } as Article;
    (service.createArticle as jest.Mock).mockResolvedValue(article);
    const result = await controller.createArticle(dto, user);
    expect(service.createArticle).toHaveBeenCalledWith(dto, user);
    expect(result).toBe(article);
  });

  it('getArticles returns array', async () => {
    const filter = {} as GetArticlesFilterDto;
    const arr = [] as Article[];
    (service.getArticles as jest.Mock).mockResolvedValue(arr);
    const result = await controller.getArticles(filter);
    expect(service.getArticles).toHaveBeenCalledWith(filter);
    expect(result).toBe(arr);
  });

  it('getArticleById returns article', async () => {
    const art = {} as Article;
    (service.getArticleById as jest.Mock).mockResolvedValue(art);
    const result = await controller.getArticleById(1);
    expect(service.getArticleById).toHaveBeenCalledWith(1);
    expect(result).toBe(art);
  });

  it('updateArticle returns updated', async () => {
    const dto = { title: 'n' } as UpdateArticleDto;
    const art = {} as Article;
    (service.updateArticle as jest.Mock).mockResolvedValue(art);
    const result = await controller.updateArticle(1, dto, user);
    expect(service.updateArticle).toHaveBeenCalledWith(1, dto, user);
    expect(result).toBe(art);
  });

  it('deleteArticle completes', async () => {
    (service.deleteArticle as jest.Mock).mockResolvedValue(undefined);
    await controller.deleteArticle(1, user);
    expect(service.deleteArticle).toHaveBeenCalledWith(1, user);
  });
});
