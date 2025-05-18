import { IsString, MinLength, MaxLength } from 'class-validator';

export class CreateArticleDto {
  @IsString()
  @MinLength(5)
  @MaxLength(100)
  title: string;

  @IsString()
  @MinLength(10)
  description: string;
}