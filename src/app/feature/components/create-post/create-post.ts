import {
  Component,
  ElementRef,
  computed,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Posts } from '../../../core/user/services/posts/posts';

@Component({
  selector: 'app-create-post',
  imports: [FormsModule],
  templateUrl: './create-post.html',
  styleUrl: './create-post.css',
})
export class CreatePost {
  // Signal Input & Output
  readonly userData = input<any>(null);
  readonly postCreated = output<void>();
  readonly myPhoto = input<string>('');
  // Signal View Query
  readonly fileInputRef = viewChild<ElementRef<HTMLInputElement>>('fileInput');

  private readonly postsService = inject(Posts);

  // Reactive State Signals
  readonly content = signal<string>('');
  readonly privacy = signal<string>('public');
  readonly selectedFile = signal<File | null>(null);
  readonly imagePreview = signal<string | null>(null);
  readonly isLoading = signal<boolean>(false);
  readonly errorMessage = signal<string>('');

  // Computed Signals
  readonly firstName = computed(() => this.userData()?.name?.split(' ')[0] || '');
  readonly hasContentOrImage = computed(
    () => Boolean(this.content().trim() || this.selectedFile())
  );
  readonly isSubmitDisabled = computed(
    () => this.isLoading() || !this.hasContentOrImage()
  );

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.selectedFile.set(file);
      if (this.imagePreview()) {
        URL.revokeObjectURL(this.imagePreview()!);
      }
      this.imagePreview.set(URL.createObjectURL(file));
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

  submitPost(): void {
    const text = this.content().trim();
    const file = this.selectedFile();

    if (this.isSubmitDisabled()) {
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    let payload: FormData | { body: string };
    if (file) {
      const formData = new FormData();
      if (text) {
        formData.append('body', text);
      }
      formData.append('image', file);
      payload = formData;
    } else {
      payload = {
        body: text,
      };
    }

    this.postsService.createPost(payload).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.content.set('');
        this.removeImage();
        this.postCreated.emit();
      },
      error: (err) => {
        this.isLoading.set(false);
        console.error('Error creating post:', err);
        this.errorMessage.set(
          err?.error?.message || 'Failed to create post. Please try again.'
        );
      },
    });
  }
}

