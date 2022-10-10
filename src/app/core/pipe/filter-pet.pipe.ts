import { Pipe, PipeTransform } from '@angular/core';
import { Pet } from '../model/appointment.model';

@Pipe({
  name: 'filterPet'
})
export class FilterPetPipe implements PipeTransform {

  transform(value: Pet[] = [], args: string) {
    const keyword = args.toLowerCase();
    return value.filter(x=>x.name.toLowerCase().includes(keyword) ||
    x.name.toLowerCase().includes(keyword) ||
    x.petCategory.name.toLowerCase().includes(keyword) ||
    x.petCategory.petType.name.toLowerCase().includes(keyword));
  }

}
