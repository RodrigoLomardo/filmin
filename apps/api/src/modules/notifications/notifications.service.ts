import { Injectable } from '@nestjs/common';
import { Subject } from 'rxjs';

export type NotificationEvent = {
  type: string;
  data: string; // JSON string
};

@Injectable()
export class NotificationsService {
  private readonly connections = new Map<string, Subject<NotificationEvent>>();

  register(profileId: string, subject: Subject<NotificationEvent>): void {
    const existing = this.connections.get(profileId);
    if (existing && !existing.closed) {
      existing.complete();
    }
    this.connections.set(profileId, subject);
  }

  unregister(profileId: string): void {
    this.connections.delete(profileId);
  }

  emit(profileId: string, type: string, data: unknown): void {
    const subject = this.connections.get(profileId);
    if (subject && !subject.closed) {
      subject.next({ type, data: JSON.stringify(data) });
    }
  }
}
