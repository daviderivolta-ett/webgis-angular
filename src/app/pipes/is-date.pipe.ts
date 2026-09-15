/* Dependencies */
import { Pipe, PipeTransform } from '@angular/core';

/* Pipe */
@Pipe({
  name: 'isDate'
})
export class IsDatePipe implements PipeTransform {

  transform(value: string): boolean {
    if (typeof value !== 'string') return false;

    const ISO_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/;
    if (!ISO_REGEX.test(value)) return false;

    return !isNaN(new Date(value).valueOf());
  }

}
