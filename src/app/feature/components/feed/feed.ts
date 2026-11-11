import { Component, inject, OnInit, signal } from '@angular/core';
import { IPost, IUserInfo } from '../../../core/models/user/posts';
import { Posts } from '../../../core/user/services/posts/posts';
import { CreatePost } from '../create-post/create-post';
import { SharePost } from '../share-post/share-post';
import { PostCardComponent } from '../post-card-component/post-card-component';
import { LeftAside } from '../left-aside/left-aside';
import { RightAside } from '../right-aside/right-aside';
import { ProfilesServ } from '../../../core/user/services/profile/profiles-serv';

export type FeedTab = 'feed' | 'myPosts' | 'community' | 'savedPosts';

@Component({
  selector: 'app-feed',
  imports: [CreatePost, SharePost, PostCardComponent, LeftAside, RightAside],
  templateUrl: './feed.html',
  styleUrl: './feed.css',
})
export class Feed implements OnInit {
  private readonly posts = inject(Posts);
  readonly profilesServ = inject(ProfilesServ);
  errorMassage=signal('')
  // User Signals
  readonly myId = signal<string>('');
  readonly userData = signal<IUserInfo>({} as IUserInfo);
  readonly myPhoto = signal<string>('');

  // Posts Signal
  readonly allpostsArray = signal<IPost[]>([]);

  readonly activeTab = signal<FeedTab>('feed');

  // Edit Post Signals
  readonly editPost = signal<string | null>(null);
  readonly editPostContent = signal<string>('');
  readonly isEditingPostLoading = signal<boolean>(false);

  // Share Post Signal
  readonly sharingPost = signal<IPost | null>(null);

  ngOnInit(): void {
    this.getUserInfo();
    this.loadCurrentPosts();
    this.getMyPhoto();
  }

  // User Information
  getUserInfo(): void {
    const storedUser = localStorage.getItem('socialUser');
    if (!storedUser) return;

    try {
      const user = JSON.parse(storedUser);
      this.userData.set(user as IUserInfo);
      this.myId.set(user._id || '');
    } catch (error) {
      console.error('Error parsing socialUser:', error);
    }
  }

  changeTab(tab: FeedTab): void {
    this.activeTab.set(tab);
    this.loadCurrentPosts();
  }
  onTabClick(tab: FeedTab): void {
    this.changeTab(tab as FeedTab);
  }

  loadCurrentPosts(): void {
    const tab = this.activeTab();

    switch (tab) {
      case 'feed':
        this.getHomeFeedPosts();
        break;
      case 'myPosts':
        this.getMyPosts();
        break;
      case 'savedPosts':
        this.getSavedPosts();
        break;
      case 'community':
        this.getAllPosts();
        break;
    }
  }

  // Get feed home posts
  getHomeFeedPosts(): void {
    this.posts.getHomeFeed().subscribe({
      next: (res: any) => {
        this.allpostsArray.set(res?.data?.posts ?? []);

      },
      error: (err) => {
        console.error('Error loading posts:', err);
        ;
      },
    });
  }

  // Get All Posts (Community)
  getAllPosts(): void {
    this.posts.allPosts().subscribe({
      next: (res: any) => {
        this.allpostsArray.set(res?.data?.posts ?? []);
        ;

      },
      error: (err) => console.error('Error loading posts:', err),
    });
  }

  // Get My Posts
  getMyPosts(): void {
    const userId = this.myId();
    if (!userId) return;

    this.posts.getUserPosts(userId).subscribe({
      next: (res: any) => {
        this.allpostsArray.set(res?.data?.posts ?? []);
        ;

      },
      error: (err) => console.error('Error loading my posts:', err),
    });
  }

  // Get Saved Posts
  getSavedPosts(): void {
    this.posts.getSavedPosts().subscribe({
      next: (res: any) => {
        this.allpostsArray.set(res?.data?.bookmarks ?? []);
      },
      error: (err) => console.error('Error loading saved posts:', err),
    });
  }

  // Like Post
  likePost(id: string): void {
    const currentUserId = this.myId();
    if (!currentUserId) return;

    this.allpostsArray.update(posts =>
      posts.map(post => {
        if (post._id !== id) return post;
        const isLiked = post.likes.includes(currentUserId);
        const updatedLikes = isLiked
          ? post.likes.filter(userId => userId !== currentUserId)
          : [...post.likes, currentUserId];

        return {
          ...post,
          likes: updatedLikes,
          likesCount: updatedLikes.length
        };
      })
    );

    this.posts.like_unlikePost(id).subscribe({
      error: (err) => {
        console.error('Like error:', err);
        this.loadCurrentPosts();
      }
    });
  }

  // Edit Post
  editPosts(post: IPost): void {
    if (this.editPost() === post._id) {
      this.cancelEditPost();
      return;
    }

    this.editPost.set(post._id);
    this.editPostContent.set(post.body || '');
  }

  cancelEditPost(): void {
    this.editPost.set(null);
    this.editPostContent.set('');
  }

  submitEdit(postId: string): void {
    const text = this.editPostContent().trim();

    if (!text || this.isEditingPostLoading()) return;

    this.isEditingPostLoading.set(true);

    this.posts.updatePost(postId, { body: text }).subscribe({
      next: () => {
        this.allpostsArray.update(posts =>
          posts.map(post =>
            post._id === postId
              ? { ...post, body: text }
              : post
          )
        );

        this.isEditingPostLoading.set(false);
        this.cancelEditPost();
      },
      error: (err) => {
        this.isEditingPostLoading.set(false);
        console.error('Error updating post:', err);
      },
    });
  }

  // Bookmark Post
  bookmarkPost(postId: string): void {
    this.allpostsArray.update(posts =>
      posts.map(post =>
        post._id === postId
          ? { ...post, bookmarked: !post.bookmarked }
          : post
      )
    );

    this.posts.bookmarkPost(postId).subscribe({
      next: (res) => {
        if (typeof res?.data?.bookmarked === 'boolean') {
          this.allpostsArray.update(posts =>
            posts.map(post =>
              post._id === postId
                ? { ...post, bookmarked: res.data.bookmarked }
                : post
            )
          );
        }
      },
      error: (err) => {
        console.error('Bookmark error:', err);
        this.allpostsArray.update(posts =>
          posts.map(post =>
            post._id === postId
              ? { ...post, bookmarked: !post.bookmarked }
              : post
          )
        );
      },
    });
  }

  // Share Post
  openShareModal(post: IPost): void {
    this.sharingPost.set(post);
  }

  closeShareModal(): void {
    this.sharingPost.set(null);
  }

  onPostShared(): void {
    this.closeShareModal();
    this.loadCurrentPosts();
  }

  // Delete Post
  deletePost(postId: string): void {
    this.posts.deletePost(postId).subscribe({
      next: () => this.loadCurrentPosts(),
      error: (err) => console.error('Delete error:', err),
    });
  }

  // Get my photo from my profile
  getMyPhoto(): void {
    this.profilesServ.getMyProfile().subscribe({
      next: (res: any) => {
        this.myPhoto.set(res?.data?.user?.photo ?? '');
      },
      error: (err) => console.error('Error loading my profile:', err),
    });
  }
}