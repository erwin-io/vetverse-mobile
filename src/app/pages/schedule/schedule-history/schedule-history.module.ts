import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ScheduleHistoryPageRoutingModule } from './schedule-history-routing.module';

import { ScheduleHistoryPage } from './schedule-history.page';
import { PipeModule } from 'src/app/core/pipe/pipe.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ScheduleHistoryPageRoutingModule,
    PipeModule
  ],
  declarations: [ScheduleHistoryPage]
})
export class ScheduleHistoryPageModule {}
