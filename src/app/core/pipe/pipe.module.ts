import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GetAgeByBirthdatePipe } from './get-age-by-birthdate.pipe';
import { FilterPetPipe } from './filter-pet.pipe';
import { FilterPetCategoryPipe } from './filter-pet-category.pipe';
import { TimeAgoPipe } from './time-ago.pipe';



@NgModule({
  declarations: [
    GetAgeByBirthdatePipe,
    FilterPetPipe,
    FilterPetCategoryPipe,
    TimeAgoPipe],
  exports: [
    GetAgeByBirthdatePipe,
    FilterPetPipe,
    FilterPetCategoryPipe,
    TimeAgoPipe]
})
export class PipeModule { }
