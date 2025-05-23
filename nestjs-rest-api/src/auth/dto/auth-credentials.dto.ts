import { IsString, MinLength, MaxLength, Matches } from 'class-validator';

export class AuthCredentialsDto {
  @IsString()
  @MinLength(4)
  @MaxLength(20)
  username: string;

  @IsString()
  @MinLength(8)
  @MaxLength(32)
  @Matches(
    /((?=.*\d)|(?=.*\W))(?=.*[A-Z])(?=.*[a-z])./,
    { message: 'Password too weak' },
  )
  password: string;
}