import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ScheduleDetailsPage } from './schedule-details.page';

const routes: Routes = [
  {
    path: '',
    component: ScheduleDetailsPage
  },
  {
    path: 'video-conference',
    loadChildren: () => import('./video-conference/video-conference.module').then( m => m.VideoConferencePageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ScheduleDetailsPageRoutingModule {}
