import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { GroupMember } from '../../groups/entities/group-member.entity';
import { GeneroUsuario } from '../../../common/enums/genero-usuario.enum';

@Entity('profiles')
export class Profile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'supabase_user_id', type: 'uuid', unique: true })
  supabaseUserId: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email?: string | null;

  @Column({ name: 'first_name', type: 'varchar', length: 100, nullable: true })
  firstName?: string | null;

  @Column({ name: 'last_name', type: 'varchar', length: 100, nullable: true })
  lastName?: string | null;

  @Column({ type: 'enum', enum: GeneroUsuario, nullable: true })
  genero?: GeneroUsuario | null;

  @OneToMany(() => GroupMember, (gm) => gm.profile)
  groupMembers: GroupMember[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
