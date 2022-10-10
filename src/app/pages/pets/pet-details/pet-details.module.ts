import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PetDetailsPageRoutingModule } from './pet-details-routing.module';

import { PetDetailsPage } from './pet-details.page';
import { PipeModule } from 'src/app/core/pipe/pipe.module';
import { MaterialModule } from 'src/app/material/material.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    PetDetailsPageRoutingModule,
    PipeModule,
    MaterialModule,
  ],
  declarations: [PetDetailsPage]
})
export class PetDetailsPageModule {}
