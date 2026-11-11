export interface IMyProfile {
  _id: string;
  name: string;
  username: string;
  email: string;
  dateOfBirth: string;
  gender: string;
  photo: string;
  cover: string;
  bookmarks: string[];
  followers: string[];
  following: string[];
  createdAt: string;
  followersCount: number;
  followingCount: number;
  bookmarksCount: number;
  id: string;
}

export interface IMyProfileResponse {
  success: boolean;
  message: string;
  data: {
    user: IMyProfile;
  };
}

export interface IFriendProfileData {
  isFollowing: boolean;
  user: IMyProfile;
}

export interface IFriendProfileResponse {
  success: boolean;
  message: string;
  data: IFriendProfileData;
}
