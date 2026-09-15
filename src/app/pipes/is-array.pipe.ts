/* Dependencies */
import { Pipe, PipeTransform } from '@angular/core'

/* Pipe */
@Pipe({
  name: 'isArray'
})
export class IsArrayPipe implements PipeTransform {

  transform(value: string): boolean {
    return Array.isArray(value);
  }

}
