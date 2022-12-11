import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ScheduleHistoryPage } from './schedule-history.page';

const routes: Routes = [
  {
    path: '',
    component: ScheduleHistoryPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ScheduleHistoryPageRoutingModule {}
