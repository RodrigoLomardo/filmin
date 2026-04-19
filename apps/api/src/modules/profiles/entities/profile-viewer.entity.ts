import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Profile } from './profile.entity';

@Entity('profile_viewers')
@Unique(['viewedProfileId', 'viewerProfileId'])
export class ProfileViewer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'viewed_profile_id', type: 'uuid' })
  viewedProfileId: string;

  @ManyToOne(() => Profile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'viewed_profile_id' })
  viewedProfile: Profile;

  @Column({ name: 'viewer_profile_id', type: 'uuid' })
  viewerProfileId: string;

  @ManyToOne(() => Profile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'viewer_profile_id' })
  viewerProfile: Profile;

  @Column({ name: 'viewed_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  viewedAt: Date;
}
