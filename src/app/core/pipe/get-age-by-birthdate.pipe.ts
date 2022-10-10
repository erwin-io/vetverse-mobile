import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'getAgeByBirthdate',
})
export class GetAgeByBirthdatePipe implements PipeTransform {
  transform(value: unknown, dateString: any) {
    const date = new Date(dateString);
    const timeDiff = Math.abs(Date.now() - new Date(date).getTime());
    const year = Math.floor(timeDiff / (1000 * 3600 * 24) / 365.25);
    const month = this.getMonths(date);
    const week = this.getWeeks(date);
    if (year > 0) {
      const type = year <= 1 ? 'year' : 'years';
      return `${year} ${type}`;
    }
    else if (month > 0) {
      const type = month <= 1 ? 'month' : 'months';
      return `${month} ${type}`;
    }
    else {
      const type = week <= 1 ? 'week' : 'weeks';
      return `${week} ${type}`;
    }
  }

  getMonths(date: Date) {
    let months = 0;
    const now = new Date();
    months = (now.getFullYear() - date.getFullYear()) * 12;
    months -= date.getMonth();
    months += now.getMonth();
    return months <= 0 ? 0 : months;
  }

  getWeeks(date: Date) {
    const now = new Date();
    let diff = (date.getTime() - now.getTime()) / 1000;
    diff /= 60 * 60 * 24 * 7;
    return Math.abs(Math.round(diff));
  }
}
