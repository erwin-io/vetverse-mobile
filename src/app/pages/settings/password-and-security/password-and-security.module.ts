import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PasswordAndSecurityPageRoutingModule } from './password-and-security-routing.module';

import { PasswordAndSecurityPage } from './password-and-security.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PasswordAndSecurityPageRoutingModule
  ],
  declarations: [PasswordAndSecurityPage]
})
export class PasswordAndSecurityPageModule {}
