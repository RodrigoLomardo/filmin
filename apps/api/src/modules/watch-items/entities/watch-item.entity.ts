import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { WatchItemStatus } from '../../../common/enums/watch-item-status.enum';
import { WatchItemTipo } from '../../../common/enums/watch-item-tipo.enum';
import { RatingStatus } from '../../../common/enums/rating-status.enum';
import { RatingField } from '../../../common/enums/rating-field.enum';
import { Genero } from '../../generos/entities/genero.entity';
import { Temporada } from '../../temporadas/entities/temporada.entity';
import { Group } from '../../groups/entities/group.entity';

@Entity('watch_items')

@Check(`"ano_lancamento" >= 1888`)
@Check(`"rewatch_count" >= 0`)
@Check(`"nota_geral" IS NULL OR ("nota_geral" >= 0 AND "nota_geral" <= 10)`)
@Check(`"nota_dele" IS NULL OR ("nota_dele" >= 0 AND "nota_dele" <= 10)`)
@Check(`"nota_dela" IS NULL OR ("nota_dela" >= 0 AND "nota_dela" <= 10)`)


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
    name: 'nota_dele',
    type: 'decimal',
    precision: 3,
    scale: 1,
    nullable: true,
  })
  notaDele?: number | null;

  @Column({
    name: 'nota_dela',
    type: 'decimal',
    precision: 3,
    scale: 1,
    nullable: true,
  })
  notaDela?: number | null;

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

  @Index()
  @Column({
    name: 'rating_status',
    type: 'enum',
    enum: RatingStatus,
    enumName: 'rating_status_enum',
    nullable: true,
  })
  ratingStatus?: RatingStatus | null;

  @Index()
  @Column({ name: 'pending_for_profile_id', type: 'uuid', nullable: true })
  pendingForProfileId?: string | null;

  @Column({ name: 'first_rating_by_profile_id', type: 'uuid', nullable: true })
  firstRatingByProfileId?: string | null;

  @Column({
    name: 'first_rating_field',
    type: 'enum',
    enum: RatingField,
    enumName: 'rating_field_enum',
    nullable: true,
  })
  firstRatingField?: RatingField | null;

  @Column({ name: 'last_rating_at', type: 'timestamptz', nullable: true })
  lastRatingAt?: Date | null;

  @Index()
  @Column({ name: 'group_id', type: 'uuid' })
  groupId: string;

  @ManyToOne(() => Group, (g) => g.watchItems, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'group_id' })
  group: Group;

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