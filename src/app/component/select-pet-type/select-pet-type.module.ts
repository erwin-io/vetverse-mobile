import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SelectPetTypeComponent } from './select-pet-type.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { MaterialModule } from 'src/app/material/material.module';



@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    MaterialModule,
  ],
  declarations: [SelectPetTypeComponent]
})
export class SelectPetTypeModule { }
