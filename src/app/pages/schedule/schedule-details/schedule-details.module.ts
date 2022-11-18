import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ScheduleDetailsPageRoutingModule } from './schedule-details-routing.module';

import { ScheduleDetailsPage } from './schedule-details.page';
import { MaterialModule } from 'src/app/material/material.module';
import { DirectiveModule } from 'src/app/core/directive/directive.module';
import { PipeModule } from 'src/app/core/pipe/pipe.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    ScheduleDetailsPageRoutingModule,
    MaterialModule,
    DirectiveModule,
    PipeModule,
  ],
  declarations: [ScheduleDetailsPage]
})
export class ScheduleDetailsPageModule {}
