import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { WatchItem } from '../../watch-items/entities/watch-item.entity';

@Entity('temporadas')
@Unique(['watchItemId', 'numero'])

@Check(`"numero" > 0`)
@Check(`"nota_dele" IS NULL OR ("nota_dele" >= 0 AND "nota_dele" <= 10)`)
@Check(`"nota_dela" IS NULL OR ("nota_dela" >= 0 AND "nota_dela" <= 10)`)
@Check(`"nota_geral" IS NULL OR ("nota_geral" >= 0 AND "nota_geral" <= 10)`)


export class Temporada {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'watch_item_id', type: 'uuid' })
  watchItemId: string;

  @ManyToOne(() => WatchItem, (watchItem) => watchItem.temporadas, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'watch_item_id' })
  watchItem: WatchItem;

  @Column({ type: 'int' })
  numero: number;

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

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}