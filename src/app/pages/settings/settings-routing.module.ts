import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SettingsPage } from './settings.page';

const routes: Routes = [
  {
    path: '',
    component: SettingsPage
  },
  {
    path: 'profile-settings',
    loadChildren: () => import('./profile-settings/profile-settings.module').then( m => m.ProfileSettingsPageModule)
  },
  {
    path: 'password-and-security',
    loadChildren: () => import('./password-and-security/password-and-security.module').then( m => m.PasswordAndSecurityPageModule)
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SettingsPageRoutingModule {}
