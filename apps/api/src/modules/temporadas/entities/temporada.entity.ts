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
@Check(`"nota" >= 0 AND "nota" <= 10`)
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

  @Column({ type: 'decimal', precision: 3, scale: 1 })
  nota: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}