import { NavigationPage } from './component/navigation/navigation/navigation.page';
import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

import { SidenavPage } from './component/sidenav/sidenav.page';
import { AuthGuard } from './core/guard/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: NavigationPage,
    children: [
      {
        path: 'profile',
        loadChildren: () => import('./pages/profile/profile.module').then(m => m.ProfilePageModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'schedule',
        loadChildren: () => import('./pages/schedule/schedule.module').then(m => m.SchedulePageModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'pets',
        loadChildren: () => import('./pages/pets/pets.module').then(m => m.PetsPageModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'notification',
        loadChildren: () => import('./pages/notification/notification.module').then( m => m.NotificationPageModule),
        canActivate: [AuthGuard]
      },
      {
        path: '',
        redirectTo: 'profile',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/auth/login/login.module').then( m => m.LoginPageModule),
    data: {
      auth: true
    }
  },
  {
    path: 'verify-otp',
    loadChildren: () => import('./pages/auth/verify-otp/verify-otp.module').then( m => m.VerifyOtpPageModule),
    data: {
      auth: true
    }
  },
  {
    path: 'signup',
    loadChildren: () => import('./pages/auth/register/register.module').then( m => m.RegisterPageModule),
    data: {
      auth: true
    }
  },
  {
    path: 'settings',
    loadChildren: () => import('./pages/settings/settings.module').then( m => m.SettingsPageModule)
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})

export class AppRoutingModule { }
