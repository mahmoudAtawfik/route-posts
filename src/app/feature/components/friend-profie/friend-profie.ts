import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { ProfilesServ } from '../../../core/user/services/profile/profiles-serv';
import { Posts } from '../../../core/user/services/posts/posts';
import { IMyProfile } from '../../../core/models/user/imy-profile';
import { IPost, IUserInfo } from '../../../core/models/user/posts';
import { PostCardComponent } from '../post-card-component/post-card-component';
import { SharePost } from '../share-post/share-post';
import { Title } from '@angular/platform-browser';


@Component({
  selector: 'app-friend-profie',
  imports: [PostCardComponent, SharePost],
  templateUrl: './friend-profie.html',
  styleUrl: './friend-profie.css',
})
export class FriendProfie implements OnInit {
  private titleService = inject(Title);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly location = inject(Location);
  private readonly profilesService = inject(ProfilesServ);
  private readonly postsService = inject(Posts);

  readonly defaultAvatar =
    'https://pub-3cba56bacf9f4965bbb0989e07dada12.r2.dev/linkedPosts/default-profile.png';

  readonly friendId = signal<string>('');
  readonly friendUser = signal<IMyProfile | null>(null);
  readonly isFollowing = signal<boolean>(false);
  readonly isFollowLoading = signal<boolean>(false);
  readonly userPosts = signal<IPost[]>([]);

  readonly isLoadingProfile = signal<boolean>(true);
  readonly isLoadingPosts = signal<boolean>(true);
  readonly errorMessage = signal<string | null>(null);
  readonly myId = signal<string>('');
  readonly sharingPost = signal<IPost | null>(null);

  ngOnInit(): void {
    const storedUser = localStorage.getItem('socialUser');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser) as IUserInfo;
        this.myId.set(user._id || '');
      } catch (err) {
        console.error('Error parsing socialUser:', err);
      }
    }

    this.activatedRoute.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.friendId.set(id);
        this.loadFriendProfile(id);
        this.loadFriendPosts(id);
      }
    });
  }

  loadFriendProfile(userId: string): void {
    this.isLoadingProfile.set(true);
    this.errorMessage.set(null);

    this.profilesService.getUserProfile(userId).subscribe({
      next: (res: any) => {
        const userData: IMyProfile = res?.data?.user;
        const followingState: boolean = res?.data?.isFollowing ?? false;

        this.friendUser.set(userData);
        this.isFollowing.set(followingState);
        this.isLoadingProfile.set(false);
        this.titleService.setTitle(
          `${res.data.user.name} Profile | Route Posts`)
      },
      error: (err) => {
        console.error('Error fetching friend profile:', err);
        this.errorMessage.set('Could not load user profile.');
        this.isLoadingProfile.set(false);
      },
    });
  }

  loadFriendPosts(userId: string): void {
    this.isLoadingPosts.set(true);

    this.postsService.getUserPosts(userId).subscribe({
      next: (res: any) => {
        const posts: IPost[] = res?.data?.posts || res?.posts || [];
        this.userPosts.set(posts);
        this.isLoadingPosts.set(false);
      },
      error: (err) => {
        console.error('Error fetching friend posts:', err);
        this.isLoadingPosts.set(false);
      },
    });
  }

  toggleFollow(): void {
    const id = this.friendId();
    if (!id || this.isFollowLoading()) return;

    this.isFollowLoading.set(true);

    this.postsService.follow_unfollowUser(id).subscribe({
      next: () => {
        this.isFollowing.update((v) => !v);
        this.isFollowLoading.set(false);
      },
      error: (err) => {
        console.error('Error toggling follow:', err);
        this.isFollowLoading.set(false);
      },
    });
  }

  likePost(postId: string): void {
    this.postsService.like_unlikePost(postId).subscribe({
      next: () => this.refreshPosts(),
    });
  }

  bookmarkPost(postId: string): void {
    this.postsService.bookmarkPost(postId).subscribe({
      next: () => this.refreshPosts(),
    });
  }

  refreshPosts(): void {
    const id = this.friendId();
    if (id) {
      this.postsService.getUserPosts(id).subscribe({
        next: (res: any) => {
          const posts: IPost[] = res?.data?.posts || res?.posts || [];
          this.userPosts.set(posts);
        },
      });
    }
  }

  openShareModal(post: IPost): void {
    this.sharingPost.set(post);
  }

  closeShareModal(): void {
    this.sharingPost.set(null);
  }

  onPostShared(): void {
    this.closeShareModal();
    this.refreshPosts();
  }

  goBack(): void {
    this.location.back();
  }
}
