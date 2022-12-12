import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ContactVetPageRoutingModule } from './contact-vet-routing.module';

import { ContactVetPage } from './contact-vet.page';
import { DirectiveModule } from 'src/app/core/directive/directive.module';
import { PipeModule } from 'src/app/core/pipe/pipe.module';
import { MaterialModule } from 'src/app/material/material.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    ContactVetPageRoutingModule,
    MaterialModule,
    DirectiveModule,
    PipeModule,
  ],
  declarations: [ContactVetPage]
})
export class ContactVetPageModule {}
