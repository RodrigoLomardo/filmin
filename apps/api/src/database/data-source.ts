import 'dotenv/config';
import { DataSource } from 'typeorm';
import { isProduction, resolveDatabaseSsl } from '../common/config/environment';
import { Achievement } from '../modules/achievements/entities/achievement.entity';
import { Genero } from '../modules/generos/entities/genero.entity';
import { Group } from '../modules/groups/entities/group.entity';
import { GroupMember } from '../modules/groups/entities/group-member.entity';
import { Nudge } from '../modules/nudges/entities/nudge.entity';
import { Profile } from '../modules/profiles/entities/profile.entity';
import { ProfileViewer } from '../modules/profiles/entities/profile-viewer.entity';
import { Streak } from '../modules/streak/streak.entity';
import { Temporada } from '../modules/temporadas/entities/temporada.entity';
import { TheoMemory } from '../modules/theo/entities/theo-memory.entity';
import { WatchItem } from '../modules/watch-items/entities/watch-item.entity';

export default new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  // Todas as entidades devem estar listadas: um migration:generate com a lista
  // incompleta geraria DROP TABLE para as entidades ausentes.
  entities: [
    WatchItem,
    Temporada,
    Genero,
    Profile,
    ProfileViewer,
    Group,
    GroupMember,
    Streak,
    Achievement,
    Nudge,
    TheoMemory,
  ],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false,
  ssl: resolveDatabaseSsl(),
  logging: !isProduction(),
  extra: {
    connectionTimeoutMillis: 10000,
  },
});
