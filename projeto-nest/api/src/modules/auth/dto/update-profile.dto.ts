import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class UpdateProfileDto {
  @ApiProperty({ example: 'Leandro Camargo' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'leandro@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
