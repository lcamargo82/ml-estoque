import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '@modules/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { MailService } from '@modules/mail/mail.service';
import { BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let mailService: jest.Mocked<MailService>;

  beforeEach(async () => {
    const mockUsersService = {
      findByEmail: jest.fn(),
      findByIdWithPassword: jest.fn(),
      findByResetToken: jest.fn(),
      update: jest.fn(),
    };

    const mockMailService = {
      sendPasswordResetEmail: jest.fn(),
    };

    const mockJwtService = {
      sign: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: MailService, useValue: mockMailService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService) as any;
    mailService = module.get(MailService) as any;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('forgotPassword', () => {
    it('should return success message even if user does not exist (preventing email enumeration)', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      const result = await service.forgotPassword({ email: 'nonexistent@test.com' });
      expect(result.message).toContain('Se o e-mail estiver cadastrado');
      expect(usersService.update).not.toHaveBeenCalled();
    });

    it('should generate token, save it and send reset email', async () => {
      const mockUser = { id: '1', email: 'test@test.com', name: 'Test User' } as any;
      usersService.findByEmail.mockResolvedValue(mockUser);
      usersService.update.mockResolvedValue({} as any);
      mailService.sendPasswordResetEmail.mockResolvedValue(undefined);

      const result = await service.forgotPassword({ email: 'test@test.com' });
      expect(result.message).toContain('Se o e-mail estiver cadastrado');
      expect(usersService.update).toHaveBeenCalledWith('1', expect.objectContaining({
        resetPasswordToken: expect.any(String),
        resetPasswordExpires: expect.any(Date),
      }));
      expect(mailService.sendPasswordResetEmail).toHaveBeenCalled();
    });
  });

  describe('resetPassword', () => {
    it('should throw BadRequestException if token is invalid', async () => {
      usersService.findByResetToken.mockResolvedValue(null);

      await expect(
        service.resetPassword({ token: 'invalid-token', password: 'newpassword123' })
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if token is expired', async () => {
      const mockUser = {
        id: '1',
        resetPasswordExpires: new Date(Date.now() - 1000),
      } as any;
      usersService.findByResetToken.mockResolvedValue(mockUser);

      await expect(
        service.resetPassword({ token: 'expired-token', password: 'newpassword123' })
      ).rejects.toThrow(BadRequestException);
    });

    it('should update password and clear token fields', async () => {
      const mockUser = {
        id: '1',
        resetPasswordExpires: new Date(Date.now() + 60000),
      } as any;
      usersService.findByResetToken.mockResolvedValue(mockUser);
      usersService.update.mockResolvedValue({} as any);

      const result = await service.resetPassword({ token: 'valid-token', password: 'newpassword123' });
      expect(result.message).toContain('Senha redefinida com sucesso');
      expect(usersService.update).toHaveBeenCalledWith('1', {
        password: 'newpassword123',
        resetPasswordToken: null,
        resetPasswordExpires: null,
      });
    });
  });

  describe('updateProfile', () => {
    it('updates only the authenticated user profile fields', async () => {
      usersService.update.mockResolvedValue({
        id: 'user-1',
        name: 'Novo Nome',
        email: 'novo@example.com',
      } as any);

      const result = await service.updateProfile('user-1', {
        name: 'Novo Nome',
        email: 'novo@example.com',
      });

      expect(usersService.update).toHaveBeenCalledWith('user-1', {
        name: 'Novo Nome',
        email: 'novo@example.com',
      });
      expect(result).not.toHaveProperty('password');
    });
  });

  describe('changePassword', () => {
    it('rejects an incorrect current password', async () => {
      usersService.findByIdWithPassword.mockResolvedValue({
        id: 'user-1',
        password: 'stored-hash',
      } as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.changePassword('user-1', {
        currentPassword: 'wrong-password',
        newPassword: 'new-secret',
      })).rejects.toThrow('Senha atual incorreta');

      expect(usersService.update).not.toHaveBeenCalled();
    });

    it('updates the password when the current password is correct', async () => {
      usersService.findByIdWithPassword.mockResolvedValue({
        id: 'user-1',
        password: 'stored-hash',
      } as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      usersService.update.mockResolvedValue({ id: 'user-1' } as any);

      const result = await service.changePassword('user-1', {
        currentPassword: 'current-secret',
        newPassword: 'new-secret',
      });

      expect(usersService.update).toHaveBeenCalledWith('user-1', {
        password: 'new-secret',
      });
      expect(result).toEqual({ message: 'Senha alterada com sucesso' });
    });
  });
});
