import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PetAddPageRoutingModule } from './pet-add-routing.module';

import { PetAddPage } from './pet-add.page';
import { MaterialModule } from 'src/app/material/material.module';
import { PipeModule } from 'src/app/core/pipe/pipe.module';
import { DirectiveModule } from 'src/app/core/directive/directive.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    MaterialModule,
    PetAddPageRoutingModule,
    DirectiveModule,
    PipeModule
  ],
  declarations: [PetAddPage]
})
export class PetAddPageModule {}
