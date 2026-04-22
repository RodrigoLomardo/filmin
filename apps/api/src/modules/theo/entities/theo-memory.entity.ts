import {
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export interface ConversationTurn {
  role: 'user' | 'assistant';
  content: string;
}

@Entity('theo_memories')
@Index('UQ_theo_memories_group_session', ['groupId', 'sessionId'], { unique: true })
export class TheoMemory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'group_id', type: 'uuid' })
  groupId: string;

  @Column({ name: 'session_id', type: 'varchar', length: 64 })
  sessionId: string;

  @Column({ name: 'recent_titles', type: 'jsonb', default: '[]' })
  recentTitles: string[];

  @Column({ name: 'conversation_history', type: 'jsonb', default: '[]' })
  conversationHistory: ConversationTurn[];

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
