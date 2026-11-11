import { Component, HostListener, input, output, signal } from '@angular/core';
import { IPost } from '../../../core/models/user/posts';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Allcomment } from '../allcomment/allcomment';
import { TopComment } from '../top-comment/top-comment';
import { WhoLikePost } from '../who-like-post/who-like-post';

@Component({
  selector: 'app-post-card-component',
  imports: [
    DatePipe,
    RouterLink,
    FormsModule,
    TopComment,
    Allcomment,
    WhoLikePost,
  ],
  templateUrl: './post-card-component.html',
  styleUrl: './post-card-component.css',
})
export class PostCardComponent {

  // Inputs
  post = input.required<IPost>();
  myId = input<string>('');

  isEditing = input<boolean>(false);
  editContent = input<string>('');
  isSaving = input<boolean>(false);

  detailsAction = input<'route' | 'comments'>('route');
  showCommentsWhenNoTopComment = input<boolean>(false);

  // Outputs
  like = output<string>();
  bookmark = output<string>();
  edit = output<IPost>();
  delete = output<string>();
  share = output<IPost>();

  editContentChange = output<string>();
  cancelEdit = output<void>();
  saveEdit = output<{ postId: string; body: string }>();
  postlikes = output<string>();

  // Local UI State
  isOptionOpen = signal<boolean>(false);
  viewAllComments = signal<boolean>(false);
  showLikesModal = signal<boolean>(false);

  // Check if current user liked this post
  isLiked(): boolean {
    return this.post().likes?.includes(this.myId()) ?? false;
  }

  // Options Menu
  toggleOptions(event: Event): void {
    event.stopPropagation();
    this.isOptionOpen.update(value => !value);
  }

  closeOptions(): void {
    this.isOptionOpen.set(false);
  }

  // Close menu when clicking outside
  @HostListener('document:click')
  onDocumentClick(): void {
    this.closeOptions();
  }

  // Bookmark
  bookmarkPost(): void {
    this.closeOptions();
    this.bookmark.emit(this.post()._id);
  }

  // Edit
  editPost(): void {
    this.closeOptions();
    this.edit.emit(this.post());
  }

  // Delete
  deletePost(): void {
    this.closeOptions();
    this.delete.emit(this.post()._id);
  }

  // Like
  likePost(): void {
    this.like.emit(this.post()._id);
  }

  // Share
  sharePost(): void {
    this.share.emit(this.post());
  }

  // Edit Content
  onEditInput(event: Event): void {
    const value = (event.target as HTMLTextAreaElement).value;
    this.editContentChange.emit(value);
  }

  // Cancel Edit
  cancelEditing(): void {
    this.cancelEdit.emit();
  }

  // Save Edit
  submitEdit(): void {
    const body = this.editContent().trim();

    if (!body || this.isSaving()) return;

    this.saveEdit.emit({
      postId: this.post()._id,
      body
    });
  }

  // Comments
  toggleComments(): void {
    this.viewAllComments.update(value => !value);
  }
  //posts like
  getpostlikes(): void {
    this.showLikesModal.set(true);
    this.postlikes.emit(this.post()._id);
  }
}
