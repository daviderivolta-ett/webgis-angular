/** Libraries */
import { Pipe, PipeTransform } from '@angular/core';

/** Pipe */
@Pipe({
  name: 'isDate'
})
export class IsDatePipe implements PipeTransform {

  transform(value: string): boolean {
    const date = new Date(value);
    return (date instanceof Date && !isNaN(date.valueOf()));
  }

}
