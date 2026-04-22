import 'dotenv/config';
import { DataSource } from 'typeorm';
import { Genero } from '../modules/generos/entities/genero.entity';
import { Group } from '../modules/groups/entities/group.entity';
import { GroupMember } from '../modules/groups/entities/group-member.entity';
import { Profile } from '../modules/profiles/entities/profile.entity';
import { Temporada } from '../modules/temporadas/entities/temporada.entity';
import { WatchItem } from '../modules/watch-items/entities/watch-item.entity';
import { TheoMemory } from '../modules/theo/entities/theo-memory.entity';

const isProduction = process.env.NODE_ENV === 'production';

export default new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [WatchItem, Temporada, Genero, Profile, Group, GroupMember, TheoMemory],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false,
  ssl: { rejectUnauthorized: false },
  logging: true,
  extra: {
    connectionTimeoutMillis: 10000,
  },
});