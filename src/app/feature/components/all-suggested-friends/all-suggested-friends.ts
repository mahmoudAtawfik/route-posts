import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IUser, IPaginationMeta } from '../../../core/models/user/posts';
import { Posts } from '../../../core/user/services/posts/posts';

@Component({
  selector: 'app-all-suggested-friends',
  imports: [RouterLink],
  templateUrl: './all-suggested-friends.html',
  styleUrl: './all-suggested-friends.css',
})
export class AllSuggestedFriends implements OnInit {
  private readonly postsService = inject(Posts);

  readonly defaultAvatar =
    'https://pub-3cba56bacf9f4965bbb0989e07dada12.r2.dev/linkedPosts/default-profile.png';

  readonly users = signal<IUser[]>([]);
  readonly pagination = signal<IPaginationMeta | null>(null);
  readonly searchQuery = signal<string>('');

  readonly isLoadingInitial = signal<boolean>(false);
  readonly isLoadingMore = signal<boolean>(false);
  readonly loadingUserId = signal<string | null>(null);
  readonly errorMessage = signal<string | null>(null);

  readonly followingMap = signal<Record<string, boolean>>({});

  readonly filteredUsers = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    const list = this.users();

    if (!query) {
      return list;
    }

    return list.filter(
      (user) =>
        user.name?.toLowerCase().includes(query) ||
        user.username?.toLowerCase().includes(query)
    );
  });

  readonly hasMorePages = computed(() => {
    const p = this.pagination();
    return p !== null && p.nextPage !== null && p.nextPage !== undefined;
  });

  ngOnInit(): void {
    this.loadInitialSuggestions();
  }

  loadInitialSuggestions(): void {
    this.isLoadingInitial.set(true);
    this.errorMessage.set(null);

    this.postsService.getFollowingsSuggestions(20, 1).subscribe({
      next: (res: any) => {
        const incoming: IUser[] =
          res?.data?.suggestions || res?.suggestions || [];

        this.users.set(incoming);
        this.pagination.set(res?.meta?.pagination || null);
        this.isLoadingInitial.set(false);
      },
      error: (err) => {
        console.error('Error fetching suggestions:', err);
        this.errorMessage.set('Failed to load suggestions. Please try again.');
        this.isLoadingInitial.set(false);
      },
    });
  }

  loadMore(): void {
    if (this.isLoadingMore() || this.isLoadingInitial()) return;

    const nextPage = this.pagination()?.nextPage;
    if (!nextPage) return;

    this.isLoadingMore.set(true);

    this.postsService.getFollowingsSuggestions(20, nextPage).subscribe({
      next: (res: any) => {
        const incoming: IUser[] =
          res?.data?.suggestions || res?.suggestions || [];

        // Append new users without duplicates based on _id
        this.users.update((prev) => {
          const existingIds = new Set(prev.map((u) => u._id));
          const fresh = incoming.filter((u: IUser) => !existingIds.has(u._id));
          return [...prev, ...fresh];
        });

        this.pagination.set(res?.meta?.pagination || null);
        this.isLoadingMore.set(false);
      },
      error: (err) => {
        console.error('Error loading more suggestions:', err);
        this.isLoadingMore.set(false);
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

  toggleFollow(user: IUser): void {
    const id = user._id;
    if (!id || this.loadingUserId() === id) return;

    const currentlyFollowing = !!this.followingMap()[id];
    this.loadingUserId.set(id);

    this.postsService.follow_unfollowUser(id).subscribe({
      next: () => {
        // Update state only after successful response
        this.followingMap.update((map) => ({
          ...map,
          [id]: !currentlyFollowing,
        }));
        this.loadingUserId.set(null);
      },
      error: (err) => {
        console.error('Error following/unfollowing user:', err);
        // Keep state unchanged on error
        this.loadingUserId.set(null);
      },
    });
  }
}
