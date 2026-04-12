import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { GroupTipo } from '../../../common/enums/group-tipo.enum';
import { GroupMember } from './group-member.entity';
import { WatchItem } from '../../watch-items/entities/watch-item.entity';

@Entity('groups')
export class Group {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: GroupTipo,
    enumName: 'group_tipo_enum',
  })
  tipo: GroupTipo;

  @Column({
    name: 'invite_code',
    type: 'varchar',
    length: 64,
    nullable: true,
    unique: true,
  })
  inviteCode?: string | null;

  @OneToMany(() => GroupMember, (gm) => gm.group)
  members: GroupMember[];

  @OneToMany(() => WatchItem, (wi) => wi.group)
  watchItems: WatchItem[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
