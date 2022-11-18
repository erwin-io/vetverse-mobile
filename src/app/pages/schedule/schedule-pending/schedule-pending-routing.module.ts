import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SchedulePendingPage } from './schedule-pending.page';

const routes: Routes = [
  {
    path: '',
    component: SchedulePendingPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SchedulePendingPageRoutingModule {}
