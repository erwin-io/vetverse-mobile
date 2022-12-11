import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ContactVetPageRoutingModule } from './contact-vet-routing.module';

import { ContactVetPage } from './contact-vet.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ContactVetPageRoutingModule
  ],
  declarations: [ContactVetPage]
})
export class ContactVetPageModule {}
