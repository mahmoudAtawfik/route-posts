import { Routes } from '@angular/router';
import { goToInGuard } from './core/auth/guards/go-to-in-guard';
import { goOutGuard } from './core/auth/guards/go-out-guard';

export const routes: Routes = [
  { path: "", redirectTo: "login", pathMatch: "full" },
  
  // Auth Layout (Lazy Loaded)
  {
    path: "",
    canActivate: [goOutGuard],
    loadComponent: () => import('./layout/auth-layout/auth-layout').then(m => m.AuthLayout),
    children: [
      { 
        path: "login", 
        loadComponent: () => import('./feature/components/login/login').then(m => m.Login) ,
        title:"Sign In"
      },
      { 
        path: "register", 
        loadComponent: () => import('./feature/components/register/register').then(m => m.Register) ,
        title:"Create Account | Route Posts"
      }
    ]
  },

  // User Layout (Lazy Loaded)
  {
    path: "",
    canActivate: [goToInGuard],
    loadComponent: () => import('./layout/user-layout/user-layout').then(m => m.UserLayout),
    children: [
      { 
        path: "feed", 
        loadComponent: () => import('./feature/components/feed/feed').then(m => m.Feed), 
        title: 'Home Feed | Route Posts' 
      },
      { 
        path: "profile", 
        loadComponent: () => import('./feature/pages/profile/profile').then(m => m.Profile), 
        title: 'Profile | Route Posts' 
      },
      { 
        path: 'post/:id', 
        loadComponent: () => import('./feature/components/single-post/single-post').then(m => m.SinglePost) 
      },
      { 
        path: 'profile/:id', 
        loadComponent: () => import('./feature/components/friend-profie/friend-profie').then(m => m.FriendProfie) 
      },
      { 
        path: "suggestions", 
        loadComponent: () => import('./feature/components/all-suggested-friends/all-suggested-friends').then(m => m.AllSuggestedFriends), 
        title: 'Suggested Friends | Route Posts' 
      },
      { 
        path: "notification", 
        loadComponent: () => import('./feature/pages/notification/notification').then(m => m.Notification), 
        title: 'Notifications | Route Posts' 
      },
      { 
        path: "settings", 
        loadComponent: () => import('./feature/pages/change-password/change-password').then(m => m.ChangePassword), 
        title: 'Change Password | Route Posts' 
      },
      { 
        path: "change-password", 
        loadComponent: () => import('./feature/pages/change-password/change-password').then(m => m.ChangePassword), 
        title: 'Change Password | Route Posts' 
      }
    ]
  },

  // Not Found (Lazy Loaded)
  { 
    path: "**", 
    loadComponent: () => import('./feature/components/not-found/not-found').then(m => m.NotFound), 
    title: 'Not Found' 
  }
];