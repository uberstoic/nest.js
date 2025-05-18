import { Controller, Post, Body, Get, Param, Query, Patch, Delete, UseGuards, ValidationPipe, ParseIntPipe } from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { GetArticlesFilterDto } from './dto/get-articles-filter.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../auth/get-user.decorator';
import { User } from '../users/user.entity';
import { Article } from './article.entity';

@Controller('articles')
export class ArticlesController {
  constructor(private articlesService: ArticlesService) {}

  @Post()
  @UseGuards(AuthGuard())
  createArticle(
    @Body(ValidationPipe) createArticleDto: CreateArticleDto,
    @GetUser() user: User,
  ): Promise<Article> {
    return this.articlesService.createArticle(createArticleDto, user);
  }

  @Get()
  getArticles(
    @Query(ValidationPipe) filterDto: GetArticlesFilterDto,
  ): Promise<Article[]> {
    return this.articlesService.getArticles(filterDto);
  }

  @Get('/:id')
  getArticleById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Article> {
    return this.articlesService.getArticleById(id);
  }

  @Patch('/:id')
  @UseGuards(AuthGuard())
  updateArticle(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) updateArticleDto: UpdateArticleDto,
    @GetUser() user: User,
  ): Promise<Article> {
    return this.articlesService.updateArticle(id, updateArticleDto, user);
  }

  @Delete('/:id')
  @UseGuards(AuthGuard())
  deleteArticle(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: User,
  ): Promise<void> {
    return this.articlesService.deleteArticle(id, user);
  }
}
