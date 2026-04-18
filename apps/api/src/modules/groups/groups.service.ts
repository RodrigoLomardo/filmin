import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, ILike, Repository } from 'typeorm';
import { randomBytes } from 'crypto';
import { GroupTipo } from '../../common/enums/group-tipo.enum';
import { Group } from './entities/group.entity';
import { GroupMember } from './entities/group-member.entity';
import { WatchItem } from '../watch-items/entities/watch-item.entity';
import { Temporada } from '../temporadas/entities/temporada.entity';
import type { GroupMeResponse } from './interfaces/group-me-response.interface';

@Injectable()
export class GroupsService {
  constructor(
    @InjectRepository(Group)
    private readonly groupsRepo: Repository<Group>,

    @InjectRepository(GroupMember)
    private readonly groupMembersRepo: Repository<GroupMember>,

    @InjectRepository(WatchItem)
    private readonly watchItemRepo: Repository<WatchItem>,

    private readonly dataSource: DataSource,
  ) {}

  /**
   * Retorna o grupo primário do usuário (duo tem prioridade sobre solo),
   * com soloGroupId para roteamento da galeria solo.
   */
  async getMyGroup(profileId: string): Promise<GroupMeResponse | null> {
    const members = await this.groupMembersRepo.find({
      where: { profileId },
      relations: { group: { members: { profile: true } } },
    });

    if (!members.length) return null;

    const soloMember = members.find((m) => m.group.tipo === GroupTipo.SOLO);
    const duoMember = members.find((m) => m.group.tipo === GroupTipo.DUO);
    const primary = duoMember ?? soloMember;

    if (!primary) return null;

    return {
      ...primary.group,
      soloGroupId: soloMember?.groupId ?? null,
    };
  }

  /**
   * Cria grupo solo para usuário sem nenhum grupo (onboarding).
   * Lança ConflictException se o usuário já pertence a qualquer grupo.
   */
  async createSolo(profileId: string): Promise<GroupMeResponse> {
    await this.assertHasNoGroups(profileId);

    const group = this.groupsRepo.create({ tipo: GroupTipo.SOLO });
    const savedGroup = await this.groupsRepo.save(group);

    await this.groupMembersRepo.save(
      this.groupMembersRepo.create({ groupId: savedGroup.id, profileId }),
    );

    return this.buildGroupMeResponse(savedGroup.id, savedGroup.id);
  }

  /**
   * Cria grupo duo e garante que o usuário também possui grupo solo.
   * Lança ConflictException se o usuário já está em um grupo duo.
   */
  async createDuo(profileId: string): Promise<GroupMeResponse> {
    await this.assertHasNoDuoGroup(profileId);

    const soloGroup = await this.ensureSoloGroup(profileId);

    const inviteCode = generateInviteCode();
    const group = this.groupsRepo.create({ tipo: GroupTipo.DUO, inviteCode });
    const savedGroup = await this.groupsRepo.save(group);

    await this.groupMembersRepo.save(
      this.groupMembersRepo.create({ groupId: savedGroup.id, profileId }),
    );

    return this.buildGroupMeResponse(savedGroup.id, soloGroup.id);
  }

  /**
   * Entra em grupo duo via invite_code.
   * Garante que o usuário possui grupo solo (cria se necessário).
   * Permite que usuários solo existentes entrem em duo sem perder seus itens.
   */
  async joinByInviteCode(profileId: string, inviteCode: string): Promise<GroupMeResponse> {
    const group = await this.groupsRepo.findOne({
      where: { inviteCode: ILike(inviteCode) },
      relations: { members: true },
    });

    if (!group) throw new NotFoundException('Convite inválido ou não encontrado.');
    if (group.tipo !== GroupTipo.DUO) throw new BadRequestException('Este grupo não aceita convites.');
    if (group.members.length >= 2) throw new ConflictException('O grupo já está completo.');

    await this.assertHasNoDuoGroup(profileId);
    const soloGroup = await this.ensureSoloGroup(profileId);

    await this.groupMembersRepo.save(
      this.groupMembersRepo.create({ groupId: group.id, profileId }),
    );

    return this.buildGroupMeResponse(group.id, soloGroup.id);
  }

  /**
   * Sai do grupo duo.
   * Clona todos os itens compartilhados para a galeria solo de ambos os membros.
   * Operação transacional — falha total em caso de erro.
   */
  async leaveDuo(profileId: string, duoGroupId: string, soloGroupId: string): Promise<void> {
    const members = await this.groupMembersRepo.find({ where: { groupId: duoGroupId } });
    const otherMember = members.find((m) => m.profileId !== profileId);

    // Garante que o outro membro tem grupo solo
    let otherSoloGroupId: string | null = null;
    if (otherMember) {
      const otherSoloGroup = await this.ensureSoloGroup(otherMember.profileId);
      otherSoloGroupId = otherSoloGroup.id;
    }

    // Carrega todos os itens do duo com relações
    const duoItems = await this.watchItemRepo.find({
      where: { groupId: duoGroupId },
      relations: { generos: true, temporadas: true },
    });

    try {
      await this.dataSource.transaction(async (manager) => {
        // Clona para o grupo solo do membro que está saindo
        for (const item of duoItems) {
          await this.cloneItemToGroup(item, soloGroupId, duoGroupId, manager);
        }

        // Clona para o grupo solo do membro que fica
        if (otherSoloGroupId) {
          for (const item of duoItems) {
            await this.cloneItemToGroup(item, otherSoloGroupId, duoGroupId, manager);
          }
        }

        // Remove o membro saindo do grupo duo
        await manager.delete(GroupMember, { groupId: duoGroupId, profileId });
      });
    } catch {
      throw new InternalServerErrorException(
        'Falha ao sair do grupo. Nenhuma alteração foi aplicada.',
      );
    }
  }

  /**
   * Garante que o usuário possui um grupo solo.
   * Se não existir, cria automaticamente.
   */
  async ensureSoloGroup(profileId: string): Promise<Group> {
    const members = await this.groupMembersRepo.find({
      where: { profileId },
      relations: { group: true },
    });

    const existing = members.find((m) => m.group.tipo === GroupTipo.SOLO);
    if (existing) {
      return this.groupsRepo.findOne({ where: { id: existing.groupId } }) as Promise<Group>;
    }

    const group = this.groupsRepo.create({ tipo: GroupTipo.SOLO });
    const savedGroup = await this.groupsRepo.save(group);
    await this.groupMembersRepo.save(
      this.groupMembersRepo.create({ groupId: savedGroup.id, profileId }),
    );
    return savedGroup;
  }

  // ─── helpers ────────────────────────────────────────────────────────────────

  private async cloneItemToGroup(
    source: WatchItem,
    targetGroupId: string,
    originGroupId: string,
    manager: EntityManager,
  ): Promise<void> {
    const clone = manager.create(WatchItem, {
      titulo: source.titulo,
      tituloOriginal: source.tituloOriginal,
      anoLancamento: source.anoLancamento,
      tipo: source.tipo,
      status: source.status,
      notaDele: source.notaDele,
      notaDela: source.notaDela,
      notaGeral: source.notaGeral,
      dataAssistida: source.dataAssistida,
      rewatchCount: source.rewatchCount,
      observacoes: source.observacoes,
      posterUrl: source.posterUrl,
      groupId: targetGroupId,
      originGroupId,
      // Limpa estado de avaliação duo — item passa a ser solo
      ratingStatus: null,
      pendingForProfileId: null,
      firstRatingByProfileId: null,
      firstRatingField: null,
      lastRatingAt: null,
    });

    const saved = await manager.save(WatchItem, clone);

    // Clona relação M:N com gêneros
    for (const genero of source.generos ?? []) {
      await manager.query(
        `INSERT INTO watch_item_generos (watch_item_id, genero_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [saved.id, genero.id],
      );
    }

    // Clona temporadas
    for (const temporada of source.temporadas ?? []) {
      const temporadaRepo = manager.getRepository(Temporada);
      await temporadaRepo.save({
        watchItemId: saved.id,
        numero: temporada.numero,
        notaDele: temporada.notaDele ?? null,
        notaDela: temporada.notaDela ?? null,
        notaGeral: temporada.notaGeral ?? null,
      });
    }
  }

  private async assertHasNoGroups(profileId: string): Promise<void> {
    const existing = await this.groupMembersRepo.findOne({ where: { profileId } });
    if (existing) throw new ConflictException('Você já pertence a um grupo.');
  }

  private async assertHasNoDuoGroup(profileId: string): Promise<void> {
    const members = await this.groupMembersRepo.find({
      where: { profileId },
      relations: { group: true },
    });
    const hasDuo = members.some((m) => m.group.tipo === GroupTipo.DUO);
    if (hasDuo) throw new ConflictException('Você já pertence a um grupo duo.');
  }

  private async buildGroupMeResponse(
    groupId: string,
    soloGroupId: string | null,
  ): Promise<GroupMeResponse> {
    const group = (await this.groupsRepo.findOne({
      where: { id: groupId },
      relations: { members: { profile: true } },
    })) as Group;

    return { ...group, soloGroupId };
  }

}

function generateInviteCode(length = 8): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = randomBytes(length);
  return Array.from(bytes)
    .map((b) => chars[b % chars.length])
    .join('');
}
