import {
  Component,
  HostListener,
  OnInit,
  inject,
  input,
  signal,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Comments } from '../../../core/user/services/comments/comments';
import { IComment, IUserInfo } from '../../../core/models/user/posts';
import { AddComment } from '../add-comment/add-comment';
import { Createreply } from '../createreply/createreply';
import { ProfilesServ } from '../../../core/user/services/profile/profiles-serv';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-allcomment',
  imports: [DatePipe, FormsModule, AddComment, Createreply, RouterLink],
  templateUrl: './allcomment.html',
  styleUrl: './allcomment.css',
})
export class Allcomment implements OnInit {
  readonly postId = input<string>();
  private readonly commentsService = inject(Comments);
  profilesServ = inject(ProfilesServ);
  myPhoto = signal<string>('');
  readonly allComment = signal<IComment[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly isSortOpen = signal<boolean>(false);
  readonly selectedSort = signal<string>('Most relevant');

  // Current logged in user info
  readonly currentUser = signal<IUserInfo | null>(null);
  readonly myId = signal<string>('');

  // Replies management
  readonly openedReplies = signal<Set<string>>(new Set());
  readonly repliesMap = signal<Record<string, IComment[]>>({});
  readonly loadingReplies = signal<Record<string, boolean>>({});

  // Options menu (3 dots)
  readonly activeOptionsMenu = signal<string | null>(null);

  // Edit Comment State
  readonly editingCommentId = signal<string | null>(null);
  readonly editCommentText = signal<string>('');

  // Edit Reply State
  readonly editingReplyId = signal<string | null>(null);
  readonly editReplyText = signal<string>('');

  readonly defaultPhoto =
    'https://pub-3cba56bacf9f4965bbb0989e07dada12.r2.dev/linkedPosts/default-profile.png';

  ngOnInit(): void {
    const storedUser = localStorage.getItem('socialUser');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        this.currentUser.set(user);
        this.myId.set(user._id || user.id || '');
      } catch (e) {
        console.error('Error parsing socialUser:', e);
      }
    }
    this.getAllComments();
    this.getMyPhoto()
  }

  // allcomment.ts
  getAllComments(): void {
    const id = this.postId();
    if (!id) {
      console.warn('Post ID is missing; skipping comment fetch.');
      return;
    }
    this.isLoading.set(true);
    this.commentsService.getComments(id).subscribe({
      next: (res: any) => {
        this.allComment.set(res?.data?.comments || []);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error fetching comments:', err);
        this.isLoading.set(false);
      },
    });
  }

  toggleSortDropdown(): void {
    this.isSortOpen.set(!this.isSortOpen());
  }

  setSort(sort: string): void {
    this.selectedSort.set(sort);
    this.isSortOpen.set(false);
  }

  handleImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    if (target && target.src !== this.defaultPhoto) {
      target.src = this.defaultPhoto;
    }
  }

  // --- Like / Unlike Comment ---
  isCommentLiked(comment: IComment): boolean {
    const currentUserId = this.myId();
    if (!currentUserId || !comment.likes) return false;
    return comment.likes.some((like: any) => {
      const id = typeof like === 'string' ? like : like?._id || like?.id;
      return id === currentUserId;
    });
  }

  toggleLikeComment(comment: IComment): void {
    const postId = this.postId() || '6ade1fedfbc846000be78154';
    const commentId = comment._id;
    const currentUserId = this.myId();
    const currentlyLiked = this.isCommentLiked(comment);

    // Optimistic update
    this.allComment.update((comments) =>
      comments.map((c) => {
        if (c._id !== commentId) return c;
        let newLikes = [...(c.likes || [])];
        if (currentlyLiked) {
          newLikes = newLikes.filter((like: any) => {
            const id = typeof like === 'string' ? like : like?._id || like?.id;
            return id !== currentUserId;
          });
        } else {
          newLikes.push(currentUserId);
        }
        return { ...c, likes: newLikes };
      })
    );

    this.commentsService.likeCommentunlike(postId, commentId).subscribe({
      next: (res) => {
        if (res?.data?.comment?.likes) {
          this.allComment.update((comments) =>
            comments.map((c) =>
              c._id === commentId ? { ...c, likes: res.data.comment.likes } : c
            )
          );
        }
      },
      error: (err) => {
        console.error('Error toggling like:', err);
        this.getAllComments();
      },
    });
  }

  // --- Reply Section Toggle & Loading ---
  isRepliesOpen(commentId: string): boolean {
    return this.openedReplies().has(commentId);
  }

  toggleReplies(commentId: string): void {
    const updated = new Set(this.openedReplies());
    if (updated.has(commentId)) {
      updated.delete(commentId);
      this.openedReplies.set(updated);
    } else {
      updated.add(commentId);
      this.openedReplies.set(updated);
      this.loadReplies(commentId);
    }
  }

  loadReplies(commentId: string): void {
    const postId = this.postId()||'' ;
    this.loadingReplies.update((m) => ({ ...m, [commentId]: true }));
    this.commentsService.getCommentsReplies(postId, commentId).subscribe({
      next: (res: any) => {
        const replies = res?.data?.replies || res?.data?.comments || [];
        this.repliesMap.update((m) => ({ ...m, [commentId]: replies }));
        this.loadingReplies.update((m) => ({ ...m, [commentId]: false }));
      },
      error: (err) => {
        console.error('Error fetching replies:', err);
        this.loadingReplies.update((m) => ({ ...m, [commentId]: false }));
      },
    });
  }

  onReplyCreated(commentId: string): void {
    this.allComment.update((comments) =>
      comments.map((c) =>
        c._id === commentId
          ? { ...c, repliesCount: (c.repliesCount || 0) + 1 }
          : c
      )
    );
    this.loadReplies(commentId);
  }

  // --- Ownership Check (Is it to me?) ---
  isMyComment(comment: IComment): boolean {
    const currentUserId = this.myId();
    if (!currentUserId || !comment.commentCreator) return false;
    const creatorId =
      typeof comment.commentCreator === 'string'
        ? comment.commentCreator
        : comment.commentCreator._id;
    return creatorId === currentUserId;
  }

  isMyReply(reply: IComment): boolean {
    const currentUserId = this.myId();
    if (!currentUserId || !reply.commentCreator) return false;
    const creatorId =
      typeof reply.commentCreator === 'string'
        ? reply.commentCreator
        : reply.commentCreator._id;
    return creatorId === currentUserId;
  }

  // --- Options Menu (3 dots) ---
  toggleOptionsMenu(id: string, event: MouseEvent): void {
    event.stopPropagation();
    this.activeOptionsMenu.update((current) => (current === id ? null : id));
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.activeOptionsMenu.set(null);
  }

  // --- Edit & Delete Comment ---
  startEditComment(comment: IComment): void {
    this.editingCommentId.set(comment._id);
    this.editCommentText.set(comment.content || '');
    this.activeOptionsMenu.set(null);
  }

  cancelEditComment(): void {
    this.editingCommentId.set(null);
    this.editCommentText.set('');
  }

  saveEditComment(comment: IComment): void {
    const text = this.editCommentText().trim();
    if (!text) return;
    const postId = this.postId() || '';

    this.commentsService.updateComment(postId, comment._id, { content: text }).subscribe({
      next: () => {
        this.allComment.update((comments) =>
          comments.map((c) => (c._id === comment._id ? { ...c, content: text } : c))
        );
        this.editingCommentId.set(null);
      },
      error: (err) => console.error('Error updating comment:', err),
    });
  }

  deleteComment(commentId: string): void {
    const postId = this.postId() || '';
    this.activeOptionsMenu.set(null);
    this.allComment.update((comments) => comments.filter((c) => c._id !== commentId));

    this.commentsService.deleteComment(postId, commentId).subscribe({
      next: () => { },
      error: (err) => {
        console.error('Error deleting comment:', err);
        this.getAllComments();
      },
    });
  }

  // --- Reply Actions (Like, Edit, Delete) ---
  isReplyLiked(reply: IComment): boolean {
    const currentUserId = this.myId();
    if (!currentUserId || !reply.likes) return false;
    return reply.likes.some((like: any) => {
      const id = typeof like === 'string' ? like : like?._id || like?.id;
      return id === currentUserId;
    });
  }

  toggleLikeReply(commentId: string, reply: IComment): void {
    const postId = this.postId() || '';
    const replyId = reply._id;
    const currentUserId = this.myId();
    const currentlyLiked = this.isReplyLiked(reply);

    this.repliesMap.update((m) => {
      const list = m[commentId] || [];
      const updatedList = list.map((r) => {
        if (r._id !== replyId) return r;
        let newLikes = [...(r.likes || [])];
        if (currentlyLiked) {
          newLikes = newLikes.filter((l: any) => {
            const id = typeof l === 'string' ? l : l?._id || l?.id;
            return id !== currentUserId;
          });
        } else {
          newLikes.push(currentUserId);
        }
        return { ...r, likes: newLikes };
      });
      return { ...m, [commentId]: updatedList };
    });

    this.commentsService.likeCommentunlike(postId, replyId).subscribe({
      error: (err) => {
        console.error('Error liking reply:', err);
        this.loadReplies(commentId);
      },
    });
  }

  startEditReply(reply: IComment): void {
    this.editingReplyId.set(reply._id);
    this.editReplyText.set(reply.content || '');
    this.activeOptionsMenu.set(null);
  }

  cancelEditReply(): void {
    this.editingReplyId.set(null);
    this.editReplyText.set('');
  }

  saveEditReply(commentId: string, reply: IComment): void {
    const text = this.editReplyText().trim();
    if (!text) return;
    const postId = this.postId() || '';

    this.commentsService.updateComment(postId, reply._id, { content: text }).subscribe({
      next: () => {
        this.repliesMap.update((m) => {
          const list = m[commentId] || [];
          return {
            ...m,
            [commentId]: list.map((r) => (r._id === reply._id ? { ...r, content: text } : r)),
          };
        });
        this.editingReplyId.set(null);
      },
      error: (err) => console.error('Error updating reply:', err),
    });
  }

  deleteReply(commentId: string, replyId: string): void {
    const postId = this.postId() || '';
    this.activeOptionsMenu.set(null);

    this.repliesMap.update((m) => {
      const list = m[commentId] || [];
      return {
        ...m,
        [commentId]: list.filter((r) => r._id !== replyId),
      };
    });

    this.allComment.update((comments) =>
      comments.map((c) =>
        c._id === commentId
          ? { ...c, repliesCount: Math.max(0, (c.repliesCount || 1) - 1) }
          : c
      )
    );

    this.commentsService.deleteComment(postId, replyId).subscribe({
      next: () => { },
      error: (err) => {
        console.error('Error deleting reply:', err);
        this.loadReplies(commentId);
      },
    });
  }

  //get my photo from my profile
  getMyPhoto() {
    this.profilesServ.getMyProfile().subscribe({
      next: (res: any) => {
        this.myPhoto.set(res.data.user.photo);
      },
      error: (err) => console.error('Error loading my profile:', err),
    });
  }
}
