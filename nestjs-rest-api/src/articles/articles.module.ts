import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { ArticlesService } from './articles.service';
import { ArticlesController } from './articles.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Article } from './article.entity';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    TypeOrmModule.forFeature([Article]),
  ],
  providers: [ArticlesService],
  controllers: [ArticlesController],
})
export class ArticlesModule {}
