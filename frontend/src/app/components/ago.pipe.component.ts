import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({
  name: 'timeAgo',
})
export class MomentAgoPipe implements PipeTransform {
  transform(value: Date | moment.Moment): any {
    return moment(value).fromNow();
  }
}
