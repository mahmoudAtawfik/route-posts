import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Notifications {
  private readonly httpClient = inject(HttpClient);
  unreadNotificationCount = signal<number>(0);

  getNotification(unread?: boolean, page: number = 1, limit: number = 20): Observable<any> {
    let url = `${environment.paseurl}/notifications?page=${page}&limit=${limit}`;
    if (unread !== undefined) {
      url += `&unread=${unread}`;
    }
    return this.httpClient.get(url);
  }

  getUnreadCount(): Observable<any> {
    return this.httpClient.get(`${environment.paseurl}/notifications/unread-count`);
  }

  markNotificationAsRead(notificationId: string): Observable<any> {
    return this.httpClient.patch(
      `${environment.paseurl}/notifications/${notificationId}/read`,
      {}
    );
  }

  markAllAsRead(): Observable<any> {
    return this.httpClient.patch(
      `${environment.paseurl}/notifications/read-all`,
      {}
    );
  }
}
