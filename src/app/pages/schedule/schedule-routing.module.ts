import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SchedulePage } from './schedule.page';

const routes: Routes = [
  {
    path: '',
    component: SchedulePage
  },
  {
    path: 'schedule-details',
    loadChildren: () => import('./schedule-details/schedule-details.module').then( m => m.ScheduleDetailsPageModule)
  },
  {
    path: 'add-schedule',
    loadChildren: () => import('./add-schedule/add-schedule.module').then( m => m.AddSchedulePageModule)
  },
  {
    path: 'schedule-pending',
    loadChildren: () => import('./schedule-pending/schedule-pending.module').then( m => m.SchedulePendingPageModule)
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SchedulePageRoutingModule {}
