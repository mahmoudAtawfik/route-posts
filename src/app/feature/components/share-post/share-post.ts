import {
  Component,
  HostListener,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Posts } from '../../../core/user/services/posts/posts';
import { IPost } from '../../../core/models/user/posts';

@Component({
  selector: 'app-share-post',
  imports: [FormsModule],
  templateUrl: './share-post.html',
  styleUrl: './share-post.css',
})
export class SharePost {
  readonly post = input<IPost | null>(null);
  readonly close = output<void>();
  readonly postShared = output<any>();

  private readonly postsService = inject(Posts);

  readonly content = signal<string>('');
  readonly isLoading = signal<boolean>(false);
  readonly errorMessage = signal<string>('');

  readonly defaultPhoto =
    'https://pub-3cba56bacf9f4965bbb0989e07dada12.r2.dev/linkedPosts/default-profile.png';

  readonly targetPost = computed(() => {
    const p = this.post();
    return p?.isShare && p?.sharedPost ? p.sharedPost : p;
  });

  readonly authorName = computed(() => {
    return this.targetPost()?.user?.name || 'User';
  });

  readonly authorHandle = computed(() => {
    return this.targetPost()?.user?.username || this.authorName();
  });

  readonly authorPhoto = computed(() => {
    return this.targetPost()?.user?.photo || this.defaultPhoto;
  });

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.onClose();
  }

  onClose(): void {
    if (!this.isLoading()) {
      this.content.set('');
      this.errorMessage.set('');
      this.close.emit();
    }
  }

  handleImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    if (target && target.src !== this.defaultPhoto) {
      target.src = this.defaultPhoto;
    }
  }

  share(): void {
    const currentPost = this.post();
    if (!currentPost?._id || this.isLoading()) return;

    this.isLoading.set(true);
    this.errorMessage.set('');

    const text = this.content().trim();
    const payload = text ? { body: text } : {};

    this.postsService.sharePost(currentPost._id, payload).subscribe({
      next: (res: any) => {
        this.isLoading.set(false);
        this.content.set('');
        this.postShared.emit(res);
        this.close.emit();
      },
      error: (err: any) => {
        this.isLoading.set(false);
        console.error('Error sharing post:', err);
        this.errorMessage.set(
          err?.error?.message || 'Failed to share post. Please try again.'
        );
      },
    });
  }
}
