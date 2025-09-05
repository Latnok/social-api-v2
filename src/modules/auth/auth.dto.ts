import { IsEmail, IsNotEmpty, MinLength, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class RegisterDto {
  @IsEmail()
  @Transform(({ value }) => String(value).toLowerCase().trim())
  email!: string;

  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(100)
  password!: string;

  @IsNotEmpty()
  @MaxLength(100)
  @Transform(({ value }) => String(value).trim())
  displayName!: string;
}

export class LoginDto {
  @IsEmail()
  @Transform(({ value }) => String(value).toLowerCase().trim())
  email!: string;

  @IsNotEmpty()
  @MaxLength(100)
  password!: string;
}
