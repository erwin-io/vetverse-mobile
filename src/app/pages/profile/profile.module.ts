import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ProfilePageRoutingModule } from './profile-routing.module';

import { ProfilePage } from './profile.page';
import { PipeModule } from 'src/app/core/pipe/pipe.module';
import { MaterialModule } from 'src/app/material/material.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    ProfilePageRoutingModule,
    MaterialModule,
    PipeModule,
  ],
  declarations: [ProfilePage]
})
export class ProfilePageModule {}
