import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddSchedulePageRoutingModule } from './add-schedule-routing.module';

import { AddSchedulePage } from './add-schedule.page';
import { MaterialModule } from 'src/app/material/material.module';
import { DirectiveModule } from 'src/app/core/directive/directive.module';
import { PipeModule } from 'src/app/core/pipe/pipe.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    AddSchedulePageRoutingModule,
    MaterialModule,
    DirectiveModule,
    PipeModule,
  ],
  declarations: [AddSchedulePage]
})
export class AddSchedulePageModule {}
