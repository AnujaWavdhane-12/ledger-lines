import { Pipe, PipeTransform } from '@angular/core';
import moment from 'moment';

@Pipe({
  name: 'dateFormat',
})
export class MomentPipe implements PipeTransform {
  transform(value: string): any {
    try {
      // Split timestamp into [ Y, M, D, h, m, s ]
      const dateParts = value.split(/[- :]/);

      // Create a date object from the parts
      const newValue = new Date(Number(dateParts[0]), Number(dateParts[1]) - 1, Number(dateParts[2]));

      return moment(newValue).format('L');
    } catch (e) {
      return 'Invalid date.';
    }
  }
}
