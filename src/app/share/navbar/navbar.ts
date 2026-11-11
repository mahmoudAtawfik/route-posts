import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { initFlowbite } from 'flowbite';
import { IUserInfo } from '../../core/models/user/posts';
import { Notifications } from '../../core/user/services/notification/notifications';
import { ProfilesServ } from '../../core/user/services/profile/profiles-serv';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})

export class NavbarComponent implements OnInit {
  isMenuOpen = false;
  userData = signal<IUserInfo>({}as IUserInfo);
  notification=inject(Notifications)
  // unreadNotificationCount=signal<number>(0)
  private readonly router = inject(Router)
  profilesServ=inject(ProfilesServ)
  myPhoto = this.profilesServ.myPhoto
  unReadNofications=this.notification.unreadNotificationCount
  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      initFlowbite(); 
    }
    this.getUserInfo()
    this.getUnreadNotificationCount()
    this.getMyPhoto()
    
    

  }
  // User Information
    getUserInfo(): void {
      const storedUser = localStorage.getItem('socialUser');
  
      if (!storedUser) return;
  
      try {
        const user = JSON.parse(storedUser);
        this.userData.set(user as IUserInfo);
      } catch (error) {
        console.error('Error parsing socialUser:', error);
      }
    }
getUnreadNotificationCount() {
  this.notification.getUnreadCount().subscribe({
    next: (res) => {
      this.unReadNofications.set(res.data.unreadCount);
    }
  });
}
  
  toggleDropdown(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }
  
  closeDropdown(): void {
    this.isMenuOpen = false;
  }
  logout(){
    localStorage.removeItem('authToken')
    this.router.navigate(['/login'])
  }
  //get my photo from my profile
  getMyPhoto(){
    this.profilesServ.getMyProfile().subscribe({
      next: (res: any) => {
        this.myPhoto.set(res.data.user.photo);
      },
      error: (err) => console.error('Error loading my profile:', err),
    });
  }
}
