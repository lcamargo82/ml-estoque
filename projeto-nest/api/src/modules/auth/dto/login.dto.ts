import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'le.camargo81@gmail.com', description: 'O e-mail do usuário' })
  @IsNotEmpty()
  @IsString()
  email: string;

  @ApiProperty({ example: 'password123', description: 'A senha do usuário' })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;
}

export class RegisterDto extends LoginDto {
  @ApiProperty({ example: 'Leandro Camargo', description: 'O nome completo do usuário' })
  @IsNotEmpty()
  @IsString()
  name: string;
}
