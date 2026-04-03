import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profile } from './entities/profile.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class ProfilesService {
  constructor(
    @InjectRepository(Profile)
    private readonly profilesRepo: Repository<Profile>,
  ) {}

  async findById(profileId: string): Promise<Profile> {
    return this.profilesRepo.findOneOrFail({ where: { id: profileId } });
  }

  async update(profileId: string, dto: UpdateProfileDto): Promise<Profile> {
    await this.profilesRepo.update(profileId, dto);
    return this.findById(profileId);
  }
}
