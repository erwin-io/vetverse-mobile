import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { VideoConferencePage } from './video-conference.page';

const routes: Routes = [
  {
    path: '',
    component: VideoConferencePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VideoConferencePageRoutingModule {}
