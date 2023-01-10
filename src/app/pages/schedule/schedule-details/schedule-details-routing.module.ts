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
  },
  {
    path: 'contact-vet',
    loadChildren: () => import('./contact-vet/contact-vet.module').then( m => m.ContactVetPageModule)
  },  {
    path: 'diagnosis-attachments',
    loadChildren: () => import('./diagnosis-attachments/diagnosis-attachments.module').then( m => m.DiagnosisAttachmentsPageModule)
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ScheduleDetailsPageRoutingModule {}
