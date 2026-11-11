import { Component, computed, input, output, Signal } from '@angular/core';
import { IComment } from '../../../core/models/user/posts';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-top-comment',
  imports: [RouterLink],
  templateUrl: './top-comment.html',
  styleUrl: './top-comment.css',
})
export class TopComment {
  // Input comment with fallback to sample data
  readonly comment = input<IComment | null>(null);
  readonly commentsCount = input<number | undefined>();
  readonly viewAllComments = output<void>();

  readonly defaultPhoto =
    'https://pub-3cba56bacf9f4965bbb0989e07dada12.r2.dev/linkedPosts/default-profile.png';

  // Sample data provided by user as default/demo
  readonly defaultSampleComment: IComment = {} as IComment;

  readonly commentData = computed<IComment>(
    () => this.comment() ?? this.defaultSampleComment
  );

  handleImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    if (target && target.src !== this.defaultPhoto) {
      target.src = this.defaultPhoto;
    }
  }

  onViewAllComments(): void {
    this.viewAllComments.emit();
  }
}
