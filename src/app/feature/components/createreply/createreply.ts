import {
  Component,
  ElementRef,
  HostListener,
  OnInit,
  computed,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Comments } from '../../../core/user/services/comments/comments';
import { IUser, IUserInfo } from '../../../core/models/user/posts';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-createreply',
  imports: [FormsModule, RouterLink],
  templateUrl: './createreply.html',
  styleUrl: './createreply.css',
})
export class Createreply implements OnInit {
  // Inputs & Outputs
  readonly postId = input<string>('');
  readonly commentId = input.required<string>();
  readonly replyingTo = input<string>('');
  readonly commentCreator = input<IUser | any>(null);
  readonly userData = input<IUserInfo | any>(null);
  readonly replyCreated = output<any>();
  readonly myPhoto = input<string>('');
  // View references
  readonly fileInputRef = viewChild<ElementRef<HTMLInputElement>>('fileInput');
  readonly textareaRef = viewChild<ElementRef<HTMLTextAreaElement>>('textareaRef');
  readonly emojiContainerRef = viewChild<ElementRef<HTMLElement>>('emojiContainer');

  private readonly commentsService = inject(Comments);

  // Reactive state
  readonly content = signal<string>('');
  readonly selectedFile = signal<File | null>(null);
  readonly imagePreview = signal<string | null>(null);
  readonly isLoading = signal<boolean>(false);
  readonly errorMessage = signal<string>('');
  readonly showEmojiPicker = signal<boolean>(false);
  readonly currentUser = signal<IUserInfo | null>(null);
  private currentObjectUrl: string | null = null;

  readonly defaultPhoto =
    'https://pub-3cba56bacf9f4965bbb0989e07dada12.r2.dev/linkedPosts/default-profile.png';

  readonly popularEmojis: string[] = [
    '😀', '😂', '😍', '🥰', '😎', '😊',
    '👍', '👏', '❤️', '🔥', '🎉', '💯',
    '🙌', '😮', '😢', '🤔', '🥳', '✨',
    '🙏', '💪', '🤝', '🤩', '💡', '🚀',
  ];

  // Computeds
  readonly currentUserId = computed(() => {
    return this.userData()?._id || this.currentUser()?._id || '';
  });

  readonly userAvatar = computed(() => {
    return (
      this.userData()?.photo ||
      this.currentUser()?.photo ||
      this.defaultPhoto
    );
  });

  readonly hasContentOrImage = computed(
    () => Boolean(this.content().trim() || this.selectedFile())
  );

  readonly isSubmitDisabled = computed(
    () => this.isLoading() || !this.hasContentOrImage() || !this.commentId()
  );

  ngOnInit(): void {
    if (!this.userData()) {
      const stored = localStorage.getItem('socialUser');
      if (stored) {
        try {
          this.currentUser.set(JSON.parse(stored));
        } catch (e) {
          console.error('Error parsing socialUser:', e);
        }
      }
    }
  }

  onInput(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 100)}px`;
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.submitReply();
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.selectedFile.set(file);

      if (this.currentObjectUrl) {
        URL.revokeObjectURL(this.currentObjectUrl);
      }

      this.currentObjectUrl = URL.createObjectURL(file);
      this.imagePreview.set(this.currentObjectUrl);
    }
  }

  removeImage(): void {
    this.selectedFile.set(null);
    this.imagePreview.set(null);
    const inputEl = this.fileInputRef()?.nativeElement;
    if (inputEl) {
      inputEl.value = '';
    }
  }

  toggleEmojiPicker(event?: MouseEvent): void {
    event?.stopPropagation();
    this.showEmojiPicker.update((v) => !v);
  }

  addEmoji(emoji: string): void {
    this.content.update((val) => val + emoji);
    this.showEmojiPicker.set(false);
    setTimeout(() => {
      const textarea = this.textareaRef()?.nativeElement;
      if (textarea) {
        textarea.focus();
        textarea.style.height = 'auto';
        textarea.style.height = `${Math.min(textarea.scrollHeight, 100)}px`;
      }
    });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (
      this.showEmojiPicker() &&
      this.emojiContainerRef() &&
      !this.emojiContainerRef()!.nativeElement.contains(event.target as Node)
    ) {
      this.showEmojiPicker.set(false);
    }
  }

  handleAvatarError(event: Event): void {
    const target = event.target as HTMLImageElement;
    if (target && target.src !== this.defaultPhoto) {
      target.src = this.defaultPhoto;
    }
  }

  submitReply(): void {
    const text = this.content().trim();
    const file = this.selectedFile();
    const commentId = this.commentId();
    const postId = this.postId();
    if (!postId) {
      this.errorMessage.set('Post ID is missing. Cannot submit reply.');
      return;
    }

    if (this.isSubmitDisabled() || !commentId) {
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    let payload: FormData | { content: string };
    if (file) {
      const formData = new FormData();
      if (text) {
        formData.append('content', text);
      }
      formData.append('image', file);
      payload = formData;
    } else {
      payload = {
        content: text,
      };
    }

    this.commentsService.createReply(postId, commentId, payload).subscribe({
      next: (res: any) => {
        this.isLoading.set(false);
        this.content.set('');
        this.removeImage();
        const textarea = this.textareaRef()?.nativeElement;
        if (textarea) {
          textarea.style.height = 'auto';
        }
        this.replyCreated.emit(res);
      },
      error: (err: any) => {
        this.isLoading.set(false);
        console.error('Error posting reply:', err);
        this.errorMessage.set(
          err?.error?.message || 'Failed to post reply. Please try again.'
        );
      },
    });
  }
}
