import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DiagnosisAttachmentsPage } from './diagnosis-attachments.page';

const routes: Routes = [
  {
    path: '',
    component: DiagnosisAttachmentsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DiagnosisAttachmentsPageRoutingModule {}
