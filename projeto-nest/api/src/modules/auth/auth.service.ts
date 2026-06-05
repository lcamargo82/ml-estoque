import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '@modules/users/users.service';
import { MailService } from '@modules/mail/mail.service';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('User account is inactive');
    }

    const payload = { 
      email: user.email, 
      name: user.name,
      sub: user.id,
      role: user.role
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<{ message: string }> {
    const { email } = forgotPasswordDto;
    const user = await this.usersService.findByEmail(email);

    // Evita enumeração de e-mails por segurança
    if (!user) {
      return { message: 'Se o e-mail estiver cadastrado no sistema, você receberá um link de recuperação' };
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date();
    expires.setHours(expires.getHours() + 1); // 1 hora de expiração

    await this.usersService.update(user.id, {
      resetPasswordToken: token,
      resetPasswordExpires: expires,
    });

    try {
      await this.mailService.sendPasswordResetEmail(user.email, user.name, token);
    } catch (error) {
      // Limpa os campos no banco caso ocorra erro no disparo do e-mail
      await this.usersService.update(user.id, {
        resetPasswordToken: null,
        resetPasswordExpires: null,
      });
      throw new BadRequestException('Erro ao enviar e-mail de recuperação de senha');
    }

    return { message: 'Se o e-mail estiver cadastrado no sistema, você receberá um link de recuperação' };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{ message: string }> {
    const { token, password } = resetPasswordDto;
    const user = await this.usersService.findByResetToken(token);

    if (!user) {
      throw new BadRequestException('Token inválido ou expirado');
    }

    const now = new Date();
    if (user.resetPasswordExpires && user.resetPasswordExpires < now) {
      throw new BadRequestException('Token inválido ou expirado');
    }

    await this.usersService.update(user.id, {
      password,
      resetPasswordToken: null,
      resetPasswordExpires: null,
    });

    return { message: 'Senha redefinida com sucesso' };
  }
}
