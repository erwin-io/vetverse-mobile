import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DiagnosisAttachmentsPageRoutingModule } from './diagnosis-attachments-routing.module';

import { DiagnosisAttachmentsPage } from './diagnosis-attachments.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DiagnosisAttachmentsPageRoutingModule
  ],
  declarations: [DiagnosisAttachmentsPage]
})
export class DiagnosisAttachmentsPageModule {}
