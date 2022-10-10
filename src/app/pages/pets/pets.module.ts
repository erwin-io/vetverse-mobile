import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PetsPageRoutingModule } from './pets-routing.module';

import { PetsPage } from './pets.page';
import { MaterialModule } from 'src/app/material/material.module';
import { FilterPetPipe } from 'src/app/core/pipe/filter-pet.pipe';
import { PipeModule } from 'src/app/core/pipe/pipe.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    PetsPageRoutingModule,
    MaterialModule,
    PipeModule,
  ],
  declarations: [PetsPage]
})
export class PetsPageModule {}
