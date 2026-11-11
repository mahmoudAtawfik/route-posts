import {
  Component,
  HostListener,
  OnInit,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { Posts } from '../../../core/user/services/posts/posts';
import { RouterLink } from '@angular/router';

export interface ILikeUser {
  _id: string;
  name: string;
  username: string;
  photo: string;
}

@Component({
  selector: 'app-who-like-post',
  imports: [RouterLink],
  templateUrl: './who-like-post.html',
  styleUrl: './who-like-post.css',
})
export class WhoLikePost implements OnInit {
  readonly postId = input<string>('');
  readonly users = input<any[] | null>(null);
  readonly close = output<void>();

  private readonly postsService = inject(Posts);

  readonly usersList = signal<ILikeUser[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly errorMessage = signal<string>('');

  readonly defaultPhoto =
    'https://pub-3cba56bacf9f4965bbb0989e07dada12.r2.dev/linkedPosts/default-profile.png';

  ngOnInit(): void {
    if (this.users() && this.users()!.length > 0) {
      this.usersList.set(this.formatUsers(this.users()!));
    } else if (this.postId()) {
      this.fetchLikes(this.postId());
    }
  }

  fetchLikes(id: string): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.postsService.getPostsLike(id).subscribe({
      next: (res: any) => {
        this.isLoading.set(false);
        const raw =
          res?.data?.likes ||
          res?.data?.users ||
          res?.likes ||
          res?.users ||
          res?.data ||
          [];
        this.usersList.set(this.formatUsers(raw));
      },
      error: (err: any) => {
        this.isLoading.set(false);
        console.error('Error fetching reactions:', err);
        this.errorMessage.set(
          err?.error?.message || 'Failed to load reactions.'
        );
      },
    });
  }

  private formatUsers(rawList: any[]): ILikeUser[] {
    if (!Array.isArray(rawList)) return [];
    return rawList.map((item) => {
      const user = item?.user || item;
      return {
        _id: user?._id || user?.id || '',
        name: user?.name || 'User',
        username: user?.username || user?.name || 'user',
        photo: user?.photo || this.defaultPhoto,
      };
    });
  }

  onClose(): void {
    this.close.emit();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.onClose();
  }

  handleImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    if (target && target.src !== this.defaultPhoto) {
      target.src = this.defaultPhoto;
    }
  }
}
