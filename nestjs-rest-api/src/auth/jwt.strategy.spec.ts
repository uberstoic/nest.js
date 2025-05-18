import { JwtStrategy } from './jwt.strategy';
import { UnauthorizedException } from '@nestjs/common';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  const mockUsersService = { findByUsername: jest.fn() };
  const mockConfigService = { get: jest.fn() };

  beforeAll(() => {
    mockConfigService.get.mockReturnValue('testSecret');
    strategy = new JwtStrategy(
      mockUsersService as any,
      mockConfigService as any,
    );
  });

  describe('validate', () => {
    it('returns user when found', async () => {
      const payload = { username: 'user1', sub: 1 } as any;
      const user = { id: 1, username: 'user1' };
      mockUsersService.findByUsername.mockResolvedValue(user);
      const result = await strategy.validate(payload);
      expect(mockUsersService.findByUsername).toHaveBeenCalledWith('user1');
      expect(result).toEqual(user);
    });

    it('throws UnauthorizedException when user not found', async () => {
      mockUsersService.findByUsername.mockResolvedValue(null);
      await expect(strategy.validate({ username: 'noone', sub: 2 } as any))
        .rejects
        .toThrow(UnauthorizedException);
    });
  });
});
