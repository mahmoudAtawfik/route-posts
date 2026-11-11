import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { INotification } from '../../../core/models/user/notifications';
import { Notifications } from '../../../core/user/services/notification/notifications';

@Component({
  selector: 'app-notification',
  imports: [RouterLink],
  templateUrl: './notification.html',
  styleUrl: './notification.css',
})
export class Notification implements OnInit {
  private readonly notificationsService = inject(Notifications);

  readonly defaultAvatar =
    'https://pub-3cba56bacf9f4965bbb0989e07dada12.r2.dev/linkedPosts/default-profile.png';

  readonly activeFilter = signal<'all' | 'unread'>('all');
  readonly isLoading = signal<boolean>(false);
  readonly isMarkingAllRead = signal<boolean>(false);
  readonly markingId = signal<string | null>(null);
  readonly errorMessage = signal<string | null>(null);
  unreadNotificationCount = this.notificationsService.unreadNotificationCount


  readonly notifications = signal<INotification[]>([]);

  readonly unreadCount = computed(() => {
    return this.notifications().filter((n) => !n.isRead).length;
  });

  readonly filteredNotifications = computed(() => {
    const filter = this.activeFilter();
    const list = this.notifications();

    if (filter === 'unread') {
      return list.filter((n) => !n.isRead);
    }
    return list;
  });

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.notificationsService.getNotification().subscribe({
      next: (res: any) => {
        const list = res?.data?.notifications || res?.notifications || res?.data;
        if (Array.isArray(list) && list.length > 0) {
          this.notifications.set(list);
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.warn('API error fetching notifications, fallback to preview items:', err);
        this.isLoading.set(false);
      },
    });

    this.notificationsService.getUnreadCount().subscribe({
      next: (res: any) => {
        const count = res?.data?.unreadCount ?? res?.unreadCount ?? res?.count;
        if (typeof count === 'number') {
          // If unread count is provided by API
        }
        this.unreadNotificationCount.set(res.data.unreadCount);


      },
      error: () => { },
    });
  }

  setFilter(filter: 'all' | 'unread'): void {
    this.activeFilter.set(filter);
  }

  markAsRead(item: INotification, event?: Event): void {
    if (event) event.stopPropagation();
    if (item.isRead || this.markingId() === item._id) return;

    this.markingId.set(item._id);

    this.notificationsService.markNotificationAsRead(item._id).subscribe({
      next: () => {
        this.notifications.update((list) =>
          list.map((n) => (n._id === item._id ? { ...n, isRead: true } : n))
        );

        this.markingId.set(null);

        this.notificationsService.getUnreadCount().subscribe({
          next: (res) => {
            this.notificationsService.unreadNotificationCount.set(
              res.data.unreadCount
            );
          }
        });
      },
      error: () => {
        this.markingId.set(null);
      },
    });
  }

  markAllAsRead(): void {
    if (this.isMarkingAllRead() || this.unreadCount() === 0) return;

    this.isMarkingAllRead.set(true);

    this.notificationsService.markAllAsRead().subscribe({
      next: () => {
        this.notifications.update((list) =>
          list.map((n) => ({ ...n, isRead: true }))
        );

        this.isMarkingAllRead.set(false);

        this.notificationsService.getUnreadCount().subscribe({
          next: (res) => {
            this.notificationsService.unreadNotificationCount.set(
              res.data.unreadCount
            );
          }
        });
      },
      error: () => {
        this.isMarkingAllRead.set(false);
      },
    });
  }
  getNotificationAction(notification: INotification): string {
    switch (notification.type) {
      case 'comment_post':
        return 'commented on your post';
      case 'like_post':
        return 'liked your post';
      case 'follow_user':
        return 'started following you';
      default:
        return 'interacted with your profile';
    }
  }

  getNotificationSnippet(notification: INotification): string {
    if (notification.type === 'comment_post') {
      const topComment = (notification.entity as any)?.topComment?.content;
      const entityBody = (notification.entity as any)?.body;
      return topComment || entityBody || '';
    }
    if (notification.type === 'like_post') {
      return (notification.entity as any)?.body || '';
    }
    return '';
  }

  getRelativeTime(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'just now';
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours}h`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays}d`;
    }

    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) {
      return `${diffInWeeks}w`;
    }

    return date.toLocaleDateString();
  }
}
