import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { WatchItemStatus } from '../../../common/enums/watch-item-status.enum';
import { WatchItemTipo } from '../../../common/enums/watch-item-tipo.enum';
import { Genero } from '../../generos/entities/genero.entity';
import { Temporada } from '../../temporadas/entities/temporada.entity';

@Entity('watch_items')
@Check(`"ano_lancamento" >= 1888`)
@Check(`"nota_geral" IS NULL OR ("nota_geral" >= 0 AND "nota_geral" <= 10)`)
@Check(`"rewatch_count" >= 0`)
export class WatchItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  titulo: string;

  @Column({
    name: 'titulo_original',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  tituloOriginal?: string | null;

  @Index()
  @Column({ name: 'ano_lancamento', type: 'int' })
  anoLancamento: number;

  @Index()
  @Column({
    type: 'enum',
    enum: WatchItemTipo,
    enumName: 'watch_item_tipo_enum',
  })
  tipo: WatchItemTipo;

  @Index()
  @Column({
    type: 'enum',
    enum: WatchItemStatus,
    enumName: 'watch_item_status_enum',
  })
  status: WatchItemStatus;

  @Column({
    name: 'nota_geral',
    type: 'decimal',
    precision: 3,
    scale: 1,
    nullable: true,
  })
  notaGeral?: number | null;

  @Index()
  @Column({ name: 'data_assistida', type: 'date', nullable: true })
  dataAssistida?: Date | null;

  @Column({ name: 'rewatch_count', type: 'int', default: 0 })
  rewatchCount: number;

  @Column({ type: 'text', nullable: true })
  observacoes?: string | null;

  @Column({ name: 'poster_url', type: 'text', nullable: true })
  posterUrl?: string | null;

  @OneToMany(() => Temporada, (temporada) => temporada.watchItem)
  temporadas: Temporada[];

  @ManyToMany(() => Genero, (genero) => genero.watchItems)
  @JoinTable({
    name: 'watch_item_generos',
    joinColumn: {
      name: 'watch_item_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'genero_id',
      referencedColumnName: 'id',
    },
  })
  generos: Genero[];

  @Index()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}