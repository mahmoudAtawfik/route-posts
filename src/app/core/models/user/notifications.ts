
export interface INotificationUser {
  _id: string;
  name: string;
  username?: string;
  photo: string;
}

export interface INotificationComment {
  _id: string;
  content: string;
  commentCreator: INotificationUser;
  post: string;
  parentComment: string | null;
  likes: string[];
  createdAt: string;
}

export interface INotificationPost {
  _id: string;
  body: string;
  image?: string;
  user: string;
  commentsCount: number;
  topComment?: INotificationComment;
  sharesCount: number;
  likesCount: number;
  isShare: boolean;
  id: string;
}

export interface INotificationFollowUser {
  _id: string;
  name: string;
  username: string;
  photo: string;
  followersCount: number;
  followingCount: number;
  bookmarksCount: number;
  id: string;
}

export type INotificationType =
  | 'like_post'
  | 'comment_post'
  | 'follow_user';

export interface INotification {
  _id: string;
  recipient: INotificationUser;
  actor: INotificationUser;
  type: INotificationType;
  entityType: 'post' | 'user';
  entityId: string;
  isRead: boolean;
  createdAt: string;
  entity: INotificationPost | INotificationFollowUser;
}

export interface INotificationsResponse {
  notifications: INotification[];
}
