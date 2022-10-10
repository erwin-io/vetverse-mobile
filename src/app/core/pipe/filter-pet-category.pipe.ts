import { Pipe, PipeTransform } from '@angular/core';
import { PetCategory } from '../model/appointment.model';

@Pipe({
  name: 'filterPetCategory'
})
export class FilterPetCategoryPipe implements PipeTransform {

  transform(value: PetCategory[] = [], args: string = '') {
    console.log(value.filter(x=>x.petType.petTypeId === args));
    return value.filter(x=>x.petType.petTypeId === args);
  }

}
