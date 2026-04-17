import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { StreakTipo } from '../../common/enums/streak-tipo.enum';

@Entity('streaks')
export class Streak {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'group_id', unique: true })
  groupId: string;

  @Column({ type: 'enum', enum: StreakTipo, default: StreakTipo.DAILY })
  tipo: StreakTipo;

  @Column({ name: 'sequencia_atual', default: 0 })
  sequenciaAtual: number;

  @Column({ name: 'maior_sequencia', default: 0 })
  maiorSequencia: number;

  @Column({ name: 'ultimo_registro_em', nullable: true, type: 'timestamptz' })
  ultimoRegistroEm: Date | null;

  @Column({ name: 'periodo_atual_valido', default: false })
  periodoAtualValido: boolean;

  @CreateDateColumn({ name: 'criado_em' })
  criadoEm: Date;

  @UpdateDateColumn({ name: 'atualizado_em' })
  atualizadoEm: Date;
}
