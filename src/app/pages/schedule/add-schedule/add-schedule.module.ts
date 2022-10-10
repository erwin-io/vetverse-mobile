import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddSchedulePageRoutingModule } from './add-schedule-routing.module';

import { AddSchedulePage } from './add-schedule.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AddSchedulePageRoutingModule
  ],
  declarations: [AddSchedulePage]
})
export class AddSchedulePageModule {}
