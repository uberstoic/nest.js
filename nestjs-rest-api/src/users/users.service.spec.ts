import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ConflictException, InternalServerErrorException } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { AuthCredentialsDto } from '../auth/dto/auth-credentials.dto';

describe('UsersService', () => {
  let service: UsersService;
  let repo: Partial<Record<keyof Repository<User>, jest.Mock>>;

  beforeEach(async () => {
    repo = {
      create: jest.fn(),
      save: jest.fn(),
      findOneBy: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: repo },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createUser', () => {
    it('should hash password and save user', async () => {
      const dto = { username: 'u', password: 'p' } as AuthCredentialsDto;
      const salt = 'salt';
      jest.spyOn(bcrypt, 'genSalt').mockResolvedValue(salt);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashed');
      const userEntity = { username: 'u', password: 'hashed' } as any;
      repo.create.mockReturnValue(userEntity);
      repo.save.mockResolvedValue(undefined);

      await service.createUser(dto);
      expect(bcrypt.genSalt).toHaveBeenCalled();
      expect(bcrypt.hash).toHaveBeenCalledWith('p', salt);
      expect(repo.create).toHaveBeenCalledWith({ username: 'u', password: 'hashed' });
      expect(repo.save).toHaveBeenCalledWith(userEntity);
    });

    it('should throw ConflictException on duplicate', async () => {
      const dto = { username: 'u', password: 'p' } as AuthCredentialsDto;
      jest.spyOn(bcrypt, 'genSalt').mockResolvedValue('s');
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('h');
      repo.create.mockReturnValue({} as any);
      const error = { code: '23505' } as any;
      repo.save.mockRejectedValue(error);

      await expect(service.createUser(dto)).rejects.toThrow(ConflictException);
    });

    it('should throw InternalServerErrorException on other errors', async () => {
      const dto = { username: 'u', password: 'p' } as AuthCredentialsDto;
      jest.spyOn(bcrypt, 'genSalt').mockResolvedValue('s');
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('h');
      repo.create.mockReturnValue({} as any);
      const error = new Error();
      repo.save.mockRejectedValue(error);

      await expect(service.createUser(dto)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('findByUsername', () => {
    it('should return user when found', async () => {
      const user = { username: 'u' } as User;
      repo.findOneBy.mockResolvedValue(user);
      const res = await service.findByUsername('u');
      expect(repo.findOneBy).toHaveBeenCalledWith({ username: 'u' });
      expect(res).toEqual(user);
    });
  });
});
