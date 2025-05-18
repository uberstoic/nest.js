import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UnauthorizedException } from '@nestjs/common';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: Partial<UsersService>;
  let jwtService: Partial<JwtService>;

  beforeEach(async () => {
    usersService = { createUser: jest.fn(), findByUsername: jest.fn() };
    jwtService = { sign: jest.fn().mockReturnValue('token') };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('signUp: should call usersService.createUser', async () => {
    const dto = { username: 'u', password: 'p' } as AuthCredentialsDto;
    await service.signUp(dto);
    expect(usersService.createUser).toHaveBeenCalledWith(dto);
  });

  describe('signIn', () => {
    it('should return token when credentials valid', async () => {
      const dto = { username: 'u', password: 'p' } as AuthCredentialsDto;
      (usersService.findByUsername as jest.Mock).mockResolvedValue({ username: 'u', password: 'p', id: 1 });
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);
      const result = await service.signIn(dto);
      expect(jwtService.sign).toHaveBeenCalledWith({ username: 'u', sub: 1 });
      expect(result).toEqual({ accessToken: 'token' });
    });

    it('should throw UnauthorizedException when invalid', async () => {
      const dto = { username: 'u', password: 'wrong' } as AuthCredentialsDto;
      (usersService.findByUsername as jest.Mock).mockResolvedValue({ username: 'u', password: 'p', id: 1 });
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);
      await expect(service.signIn(dto)).rejects.toThrow(UnauthorizedException);
    });
  });
});
