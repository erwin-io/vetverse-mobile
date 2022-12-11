import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PasswordAndSecurityPage } from './password-and-security.page';

const routes: Routes = [
  {
    path: '',
    component: PasswordAndSecurityPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PasswordAndSecurityPageRoutingModule {}
