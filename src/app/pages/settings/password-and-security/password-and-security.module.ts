import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PasswordAndSecurityPageRoutingModule } from './password-and-security-routing.module';

import { PasswordAndSecurityPage } from './password-and-security.page';
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
    PasswordAndSecurityPageRoutingModule,
    DirectiveModule,
    PipeModule
  ],
  declarations: [PasswordAndSecurityPage]
})
export class PasswordAndSecurityPageModule {}
