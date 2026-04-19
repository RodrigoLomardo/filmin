export class ProfileViewerEntryDto {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  viewedAt: Date;
}

export class ProfileViewersResponseDto {
  count: number;
  viewers: ProfileViewerEntryDto[];
}
