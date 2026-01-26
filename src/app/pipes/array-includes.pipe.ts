/** Dependencies */
import { Pipe, PipeTransform } from '@angular/core'

@Pipe({
    name: 'arrayIncludes'
})
export class ArrayIncludesPipe implements PipeTransform {

    transform(value: string, args: string[]): boolean {
        return args.includes(value);
    }

}