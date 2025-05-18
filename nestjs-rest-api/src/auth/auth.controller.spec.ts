import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: Partial<AuthService>;

  beforeEach(async () => {
    authService = { signUp: jest.fn(), signIn: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('signUp: should call authService.signUp', async () => {
    const dto = { username: 'u', password: 'p' } as AuthCredentialsDto;
    await controller.signUp(dto);
    expect(authService.signUp).toHaveBeenCalledWith(dto);
  });

  it('signIn: should call authService.signIn and return token', async () => {
    const dto = { username: 'u', password: 'p' } as AuthCredentialsDto;
    (authService.signIn as jest.Mock).mockResolvedValue({ accessToken: 'token' });
    const res = await controller.signIn(dto);
    expect(authService.signIn).toHaveBeenCalledWith(dto);
    expect(res).toEqual({ accessToken: 'token' });
  });
});
