import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'mapValue'
})
export class MapValuePipe implements PipeTransform {

  transform(value: string, map: Map<string, string>): string {
    return map.get(value) ?? value;
  }

}
