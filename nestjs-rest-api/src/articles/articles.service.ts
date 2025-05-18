import { Injectable, NotFoundException, UnauthorizedException, Inject, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Article } from './article.entity';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { GetArticlesFilterDto } from './dto/get-articles-filter.dto';
import { User } from '../users/user.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class ArticlesService {
  private readonly logger = new Logger(ArticlesService.name);

  constructor(
    @InjectRepository(Article)
    private articlesRepository: Repository<Article>,
    @Inject(CACHE_MANAGER)
    private cacheManager: any,
  ) {}

  async createArticle(
    createArticleDto: CreateArticleDto,
    user: User,
  ): Promise<Article> {
    const article = this.articlesRepository.create({
      ...createArticleDto,
      author: user,
    });
    await this.articlesRepository.save(article);
    try {
      await this.cacheManager.reset();
    } catch (e) {
      this.logger.warn('Cache reset failed', e);
    }
    return article;
  }

  async getArticles(
    filterDto: GetArticlesFilterDto,
  ): Promise<Article[]> {
    const { author, dateFrom, dateTo, limit = 10, offset = 0 } = filterDto;
    const key = `articles:${author || ''}:${dateFrom || ''}:${dateTo || ''}:limit=${limit}:offset=${offset}`;
    let cached: Article[] | undefined;
    try {
      cached = await this.cacheManager.get(key) as Article[];
      if (cached) return cached;
    } catch (e) {
      this.logger.warn('Cache get failed', e);
    }
    const query = this.articlesRepository.createQueryBuilder('article')
      .orderBy('article.publishedDate', 'DESC')
      .skip(offset)
      .take(limit);

    if (author) {
      query.innerJoin(
        'article.author',
        'author',
        'author.username = :username',
        { username: author },
      );
    }

    if (dateFrom) {
      query.andWhere('article.publishedDate >= :dateFrom', { dateFrom });
    }
    if (dateTo) {
      query.andWhere('article.publishedDate <= :dateTo', { dateTo });
    }

    const articles = await query.getMany();
    try {
      await this.cacheManager.set(key, articles);
    } catch (e) {
      this.logger.warn('Cache set failed', e);
    }
    return articles;
  }

  async getArticleById(
    id: number,
  ): Promise<Article> {
    const key = `article:${id}`;
    let cached: Article | undefined;
    try {
      cached = await this.cacheManager.get(key) as Article;
      if (cached) return cached;
    } catch (e) {
      this.logger.warn('Cache get failed', e);
    }
    const found = await this.articlesRepository.findOne({ where: { id } });
    if (!found) {
      throw new NotFoundException(
        `Article with ID "${id}" not found`,
      );
    }
    try {
      await this.cacheManager.set(key, found);
    } catch (e) {
      this.logger.warn('Cache set failed', e);
    }
    return found;
  }

  async updateArticle(
    id: number,
    updateArticleDto: UpdateArticleDto,
    user: User,
  ): Promise<Article> {
    const article = await this.getArticleById(id);
    if (article.author.id !== user.id) {
      throw new UnauthorizedException(
        'You can only edit your own articles',
      );
    }
    Object.assign(article, updateArticleDto);
    const updated = await this.articlesRepository.save(article);
    try {
      await this.cacheManager.reset();
    } catch (e) {
      this.logger.warn('Cache reset failed', e);
    }
    return updated;
  }

  async deleteArticle(
    id: number,
    user: User,
  ): Promise<void> {
    const result = await this.articlesRepository.delete(
      { id, author: { id: user.id } },
    );
    if (result.affected === 0) {
      throw new NotFoundException(
        `Article with ID "${id}" not found or no permission`,
      );
    }
    try {
      await this.cacheManager.reset();
    } catch (e) {
      this.logger.warn('Cache reset failed', e);
    }
  }
}
