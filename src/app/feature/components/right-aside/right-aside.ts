import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { IUser } from '../../../core/models/user/posts';
import { Posts } from '../../../core/user/services/posts/posts';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-right-aside',
  imports: [RouterLink],
  templateUrl: './right-aside.html',
  styleUrl: './right-aside.css',
})
export class RightAside implements OnInit {
  private readonly postsService = inject(Posts);

  readonly defaultAvatar =
    'https://pub-3cba56bacf9f4965bbb0989e07dada12.r2.dev/linkedPosts/default-profile.png';

  readonly searchQuery = signal('');
  readonly loadingUserId = signal<string | null>(null);
  readonly isCollapsed = signal(true);

  readonly followingMap = signal<Record<string, boolean>>({});

  readonly allSuggestedUsers = signal<IUser[]>([]);

  readonly filteredUsers = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();

    const users = this.allSuggestedUsers().filter(
      (user) => !this.followingMap()[user._id]
    );

    if (query) {
      return users.filter(
        (user) =>
          user.name?.toLowerCase().includes(query) ||
          user.username?.toLowerCase().includes(query)
      );
    }

    return users.slice(0, 5);
  });

  readonly aside_suggestedUsers = this.filteredUsers;

  ngOnInit(): void {
    this.fetchAllSuggestedUsers();
  }

  fetchAllSuggestedUsers(): void {
    this.postsService.getFollowingsSuggestions(10, 1).subscribe({
      next: (res: any) => {
        const list =
          res?.data?.suggestions || res?.suggestions || res?.data;

        if (Array.isArray(list) && list.length > 0) {
          this.allSuggestedUsers.set(list);
        }
      },
      error: (err) => {
        console.warn('Using default suggested users list:', err);
      },
    });
  }

  onSearch(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchQuery.set(target.value);
  }

  clearSearch(): void {
    this.searchQuery.set('');
  }

  toggleCollapse(): void {
    this.isCollapsed.update((val) => !val);
  }

  toggleFollow(user: IUser): void {
    const id = user._id;

    if (!id || this.loadingUserId() === id) return;

    this.loadingUserId.set(id);

    this.postsService.follow_unfollowUser(id).subscribe({
      next: () => {
        this.followingMap.update((map) => ({
          ...map,
          [id]: true,
        }));

        this.loadingUserId.set(null);
      },
      error: (err) => {
        this.followingMap.update((map) => ({
          ...map,
          [id]: true,
        }));
        this.loadingUserId.set(null);
      },
    });
  }
}