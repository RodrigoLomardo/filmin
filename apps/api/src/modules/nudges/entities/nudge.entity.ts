import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { NudgeType } from '../../../common/enums/nudge-type.enum';

@Entity('nudges')
export class Nudge {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'group_id', type: 'uuid' })
  groupId: string;

  @Column({ type: 'enum', enum: NudgeType, enumName: 'nudge_type_enum' })
  type: NudgeType;

  @Column({ type: 'text' })
  message: string;

  /** JSON com payload para navegação (ex: { watchItemId: '...' }) */
  @Column({ type: 'jsonb', nullable: true })
  data: Record<string, string> | null;

  @Index()
  @Column({ name: 'read_at', type: 'timestamptz', nullable: true })
  readAt: Date | null;

  @Index()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
