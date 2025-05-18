import { IsOptional, IsString, IsNumber, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class GetArticlesFilterDto {
  @IsOptional()
  @IsString()
  author?: string;

  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  offset?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number;
}
