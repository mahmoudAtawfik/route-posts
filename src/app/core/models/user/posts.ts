export interface IUser {
  _id: string;
  name: string;
  username: string;
  photo: string;
  mutualFollowersCount?:number;
  followersCount?: number;
}

export interface ICommentBase {
  _id: string;
  content: string;
  commentCreator: IUser;
  post: string;
  parentComment: string | null;
  likes: string[];
  createdAt: string;
  image?: string | null;
}

export interface ITopComment extends ICommentBase {
  repliesCount?: number;
}

export interface IComment extends ICommentBase {
  repliesCount?: number;
}

export interface IPost {
  _id: string;
  id: string;
  body?: string;
  image?: string;
  privacy: string;
  user: IUser;
  sharedPost?: IPost | null;
  likes: string[];
  createdAt: string;
  commentsCount: number;
  topComment?: ITopComment | null;
  sharesCount: number;
  likesCount: number;
  isShare: boolean;
  bookmarked: boolean;
}

export interface IPostsResponse {
  message: string;
  data: {
    posts: IPost[];
  };
}

export interface ICommentsResponse {
  message: string;
  data: {
    comments: IComment[];
  };
}

export interface IUserInfo {
  cover: string;
  email: string;
  name: string;
  photo: string;
  username?: string;
  _id?: string;
}

export interface IPaginationMeta {
  currentPage: number;
  numberOfPages: number;
  limit: number;
  nextPage: number | null;
  total?: number;
}

export interface ISuggestionsResponse {
  message?: string;
  data?: {
    suggestions?: IUser[];
  };
  suggestions?: IUser[];
  meta?: {
    pagination?: IPaginationMeta;
  };
}
