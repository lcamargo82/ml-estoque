import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({ example: '6a8e52e4b47d...', description: 'Token de redefinição enviado por e-mail' })
  @IsString()
  @IsNotEmpty({ message: 'O token é obrigatório' })
  token: string;

  @ApiProperty({ example: 'novaSenha123', description: 'Nova senha do usuário' })
  @IsString()
  @IsNotEmpty({ message: 'A nova senha é obrigatória' })
  @MinLength(6, { message: 'A senha deve ter pelo menos 6 caracteres' })
  password: string;
}
