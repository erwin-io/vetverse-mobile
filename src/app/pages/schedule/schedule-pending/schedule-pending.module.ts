import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SchedulePendingPageRoutingModule } from './schedule-pending-routing.module';

import { SchedulePendingPage } from './schedule-pending.page';
import { DirectiveModule } from 'src/app/core/directive/directive.module';
import { MaterialModule } from 'src/app/material/material.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    SchedulePendingPageRoutingModule,
    MaterialModule,
    DirectiveModule,
  ],
  declarations: [SchedulePendingPage]
})
export class SchedulePendingPageModule {}
