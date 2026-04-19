import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('achievements')
@Index(['groupId', 'slug'], { unique: true })
export class Achievement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'group_id', type: 'uuid' })
  groupId: string;

  @Column({ type: 'varchar', length: 100 })
  slug: string;

  @CreateDateColumn({ name: 'unlocked_at', type: 'timestamptz' })
  unlockedAt: Date;
}
