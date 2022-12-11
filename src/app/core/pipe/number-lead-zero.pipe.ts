import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'numberLeadZero'
})
export class NumberLeadZeroPipe implements PipeTransform {

  transform(value: any, args?: any): unknown {
    let s = value+'';
    while (s.length < args) {
      s = '0' + s;
    }
    return s;
  }

}
