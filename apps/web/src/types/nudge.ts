export type NudgeType = 'session' | 'continuity' | 'inactivity';

export interface Nudge {
  id: string;
  groupId: string;
  type: NudgeType;
  message: string;
  data: { watchItemId?: string } | null;
  readAt: string | null;
  createdAt: string;
}
