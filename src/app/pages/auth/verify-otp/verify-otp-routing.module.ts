import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { VerifyOtpPage } from './verify-otp.page';

const routes: Routes = [
  {
    path: '',
    component: VerifyOtpPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VerifyOtpPageRoutingModule {}
