import { IsNotEmpty, IsOptional, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class PostCreateDto {
  @IsNotEmpty()
  @MaxLength(200)
  @Transform(({ value }) => String(value).trim())
  title!: string;

  @IsNotEmpty()
  @Transform(({ value }) => String(value))
  content!: string;
}

export class PostPatchDto {
  @IsOptional()
  @MaxLength(200)
  @Transform(({ value }) => (value === undefined ? undefined : String(value).trim()))
  title?: string;

  @IsOptional()
  @Transform(({ value }) => (value === undefined ? undefined : String(value)))
  content?: string;
}
