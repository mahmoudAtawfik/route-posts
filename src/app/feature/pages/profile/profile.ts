import { Component, inject, OnInit, signal } from '@angular/core';
import { ProfilesServ } from '../../../core/user/services/profile/profiles-serv';
import { Posts } from '../../../core/user/services/posts/posts';
import { IMyProfile } from '../../../core/models/user/imy-profile';
import { IPost, IUserInfo } from '../../../core/models/user/posts';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';

import {
  ImageCropperComponent,
  ImageCroppedEvent,
  ImageTransform
} from 'ngx-image-cropper';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-profile',
  imports: [DatePipe, RouterLink, ImageCropperComponent, FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  private titleService = inject(Title);
  private readonly profileService = inject(ProfilesServ);
  private readonly postsService = inject(Posts);

  readonly defaultAvatar =
    'https://pub-3cba56bacf9f4965bbb0989e07dada12.r2.dev/linkedPosts/default-profile.png';

  readonly userProfile = signal<IMyProfile | null>(null);
  readonly myPosts = signal<IPost[]>([]);
  readonly myPostsCount = signal<number>(5);
  readonly myId = signal<string>('');
  readonly isLoading = signal<boolean>(false);
  allpostsArray = signal<IPost[]>([]);
  userData = signal<IUserInfo>({} as IUserInfo);
  checkMypost = signal(true);
  checkSavePost = signal(false);

  // Photo Editor Signals & Variables
  showPhotoEditor = signal(false);
  isUploadingPhoto = signal(false);
  imageChangedEvent: Event | null = null;
  croppedBlob: Blob | null = null;
  profilePhotoPrivacy: string = 'public';

  transform: ImageTransform = {
    scale: 1,
    rotate: 0,
    flipH: false,
    flipV: false
  };

  ngOnInit(): void {
    this.initLocalUserData();
    this.getMyProfile();
    this.getMyposts();
  }

  private initLocalUserData(): void {
    const stored = localStorage.getItem('socialUser');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        this.myId.set(parsed._id || '');
        this.userProfile.set(parsed);
      } catch (err) {
        console.error('Error parsing socialUser:', err);
      }
    }
  }

  getMyProfile(): void {
    this.isLoading.set(true);
    this.profileService.getMyProfile().subscribe({
      next: (res: any) => {
        this.userProfile.set(res.data?.user);
        this.isLoading.set(false);
        this.titleService.setTitle(
          `${res.data.user.name} Profile | Route Posts`)
          this.profileService.myPhoto.set(res.data.user.photo);
      },
      error: (err) => {
        console.warn('Could not load profile from server, using local data:', err);
        this.isLoading.set(false);
      },
    });
  }

  getUserInfo(): void {
    const storedUser = localStorage.getItem('socialUser');
    if (!storedUser) return;
    try {
      const user = JSON.parse(storedUser);
      this.userData.set(user as IUserInfo);
      this.myId.set(user._id || '');
    } catch (error) {
      console.error('Error parsing socialUser:', error);
    }
  }

  showMyPosts() {
    this.checkMypost.set(true);
    this.checkSavePost.set(false);
    this.getMyposts();
  }

  showSavedPosts() {
    this.checkMypost.set(false);
    this.checkSavePost.set(true);
    this.getSavePosts();
  }

  getMyposts() {
    this.postsService.getUserPosts(this.myId()).subscribe({
      next: (res) => {
        if (this.checkMypost() && !this.checkSavePost()) {
          this.myPosts.set(res?.data?.posts ?? []);
          this.myPostsCount.set(res?.data?.posts?.length ?? 0);
        }
      }
    });
  }

  getSavePosts() {
    this.postsService.getSavedPosts().subscribe({
      next: (res) => {
        if (!this.checkMypost() && this.checkSavePost()) {
          this.myPosts.set(res?.data?.bookmarks ?? []);
        }
      }
    });
  }

  // --- Image Cropper & Upload Logic ---
  onFileSelected(event: any): void {
    this.imageChangedEvent = event;
    this.showPhotoEditor.set(true);
  }

  closePhotoEditor(): void {
    this.showPhotoEditor.set(false);
    this.imageChangedEvent = null;
    this.croppedBlob = null;
  }

  onZoomChange(event: any): void {
    const scale = parseFloat(event.target.value);
    this.transform = {
      ...this.transform,
      scale
    };
  }

  imageCropped(event: ImageCroppedEvent): void {
    this.croppedBlob = event.blob || null;
  }

  loadImageFailed(): void {
    console.error('Failed to load image for cropping');
  }

  saveProfilePhoto(): void {
    if (!this.croppedBlob) return;

    this.isUploadingPhoto.set(true);
    const formData = new FormData();
    formData.append('photo', this.croppedBlob, 'profile.jpg');

    this.profileService.uploadProfilePhoto(formData).subscribe({
      next: (res: any) => {
        this.userProfile.update(profile => {
          if (!profile) return profile;
          return {
            ...profile,
            photo: res.data.photo
          };
        });
        this.isUploadingPhoto.set(false);
        this.closePhotoEditor();
        this.getMyposts()
        this.profileService.myPhoto.set(res.data.photo);
      },
      error: (err) => {
        console.error('Upload Error:', err);
        this.isUploadingPhoto.set(false);
      }
    });
  }
}