
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { Posts } from '../../../core/user/services/posts/posts';
import { IPost, IUserInfo } from '../../../core/models/user/posts';
import { PostCardComponent } from '../post-card-component/post-card-component';
import { SharePost } from '../share-post/share-post';
import { Title } from '@angular/platform-browser';
@Component({
  selector: 'app-single-post',
  imports: [
    PostCardComponent,
    SharePost
  ],
  templateUrl: './single-post.html',
  styleUrl: './single-post.css',
})

export class SinglePost implements OnInit {
  private titleService = inject(Title);
  private readonly route = inject(ActivatedRoute);
  private readonly location = inject(Location);
  private readonly posts = inject(Posts);

  post = signal<IPost | null>(null);
  myId = signal('');

  isLoading = signal(true);
  errorMessage = signal('');

  isEditing = signal(false);
  editPostContent = signal('');
  isEditingLoading = signal(false);

  sharingPost = signal<IPost | null>(null);

  ngOnInit(): void {
    const storedUser = localStorage.getItem('socialUser');

    if (storedUser) {
      try {
        const user = JSON.parse(storedUser) as IUserInfo;
        this.myId.set(user._id || '');
      } catch (error) {
        console.error('Error parsing socialUser:', error);
      }
    }

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');

      if (id) {
        this.getSinglePost(id);
      } else {
        this.errorMessage.set('Post not found');
        this.isLoading.set(false);
      }
    });
  }

  getSinglePost(id: string): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.posts.singlePost(id).subscribe({
      next: (res: any) => {
        const post = res?.data?.post || res?.post || res?.data;
        console.log(res);

        if (post) {
          this.post.set(post);

          this.titleService.setTitle(
            `${post.body?.trim() || 'Image Post'} | Route Posts`
          );
        } else {
          this.post.set(null);
          this.errorMessage.set('Post not found');
        }

        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading post:', err);
        this.post.set(null);
        this.errorMessage.set('Failed to load post');
        this.isLoading.set(false);
      },
    });
  }

  goBack(): void {
    this.location.back();
  }

  likePost(): void {
    const currentPost = this.post();

    if (!currentPost) return;

    this.posts.like_unlikePost(currentPost._id).subscribe({
      next: () => {
        this.getSinglePost(currentPost._id);
      },
      error: (err) => console.error('Like error:', err),
    });
  }

  bookmarkPost(): void {
    const currentPost = this.post();

    if (!currentPost) return;

    this.posts.bookmarkPost(currentPost._id).subscribe({
      next: (res) => {
        if (typeof res?.data?.bookmarked === 'boolean') {
          this.post.update(post =>
            post ? { ...post, bookmarked: res.data.bookmarked } : post
          );
        }
      },
      error: (err) => console.error('Bookmark error:', err),
    });
  }

  startEditPost(): void {
    const currentPost = this.post();

    if (!currentPost) return;

    this.isEditing.set(true);
    this.editPostContent.set(currentPost.body || '');
  }

  cancelEditPost(): void {
    this.isEditing.set(false);
    this.editPostContent.set('');
  }

  submitEdit(): void {
    const currentPost = this.post();
    const text = this.editPostContent().trim();

    if (!currentPost || !text || this.isEditingLoading()) return;

    this.isEditingLoading.set(true);

    this.posts.updatePost(currentPost._id, { body: text }).subscribe({
      next: () => {
        this.post.update(post =>
          post ? { ...post, body: text } : post
        );

        this.isEditingLoading.set(false);
        this.cancelEditPost();
      },
      error: (err) => {
        this.isEditingLoading.set(false);
        console.error('Error updating post:', err);
      },
    });
  }

  deletePost(): void {
    const currentPost = this.post();

    if (!currentPost) return;

    this.posts.deletePost(currentPost._id).subscribe({
      next: () => this.goBack(),
      error: (err) => console.error('Delete error:', err),
    });
  }

  openShareModal(): void {
    this.sharingPost.set(this.post());
  }

  closeShareModal(): void {
    this.sharingPost.set(null);
  }

  onPostShared(): void {
    const currentPost = this.post();

    if (currentPost) {
      this.getSinglePost(currentPost._id);
    }

    this.closeShareModal();
  }
}
