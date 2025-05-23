import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Article } from '../articles/article.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @OneToMany(() => Article, article => article.author)
  articles: Article[];
}
