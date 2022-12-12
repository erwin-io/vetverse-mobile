import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ProfileSettingsPageRoutingModule } from './profile-settings-routing.module';

import { ProfileSettingsPage } from './profile-settings.page';
import { DirectiveModule } from 'src/app/core/directive/directive.module';
import { PipeModule } from 'src/app/core/pipe/pipe.module';
import { MaterialModule } from 'src/app/material/material.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    MaterialModule,
    ProfileSettingsPageRoutingModule,
    DirectiveModule,
    PipeModule
  ],
  declarations: [ProfileSettingsPage]
})
export class ProfileSettingsPageModule {}
