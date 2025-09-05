import {
    Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn,
    UpdateDateColumn, DeleteDateColumn, Index, JoinColumn
  } from 'typeorm';
  import { User } from './user.entity';
  
  @Entity('posts')
  @Index('IDX_posts_createdAt', ['createdAt'])
  @Index('IDX_posts_authorId', ['authorId'])
  @Index('IDX_posts_authorId_createdAt', ['authorId', 'createdAt'])
  export class Post {
    @PrimaryGeneratedColumn({ type: 'bigint' })
    id!: string;
  
    @Column({ type: 'varchar', length: 200 })
    title!: string;
  
    @Column({ type: 'text' })
    content!: string;
  
    @Column({ type: 'bigint' })
    authorId!: string;
  
    @ManyToOne(() => User, (user) => user.posts, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'authorId' })
    author!: User;
  
    @CreateDateColumn({ type: 'datetime', precision: 3 })
    createdAt!: Date;
  
    @UpdateDateColumn({ type: 'datetime', precision: 3 })
    updatedAt!: Date;
  
    @DeleteDateColumn({ type: 'datetime', precision: 3, nullable: true })
    deletedAt?: Date | null;
  }
  