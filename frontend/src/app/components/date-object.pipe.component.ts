import { Pipe, PipeTransform } from '@angular/core';
import moment from 'moment';

@Pipe({
  name: 'dateObjectFormat',
})
export class DateObjectPipe implements PipeTransform {
  transform(value: Date): any {
    if (!(value instanceof Date)) {
      return 'Invalid date';
    }

    try {
      return moment(value).format('L');
    } catch (e) {
      return 'Invalid date';
    }
  }
}
