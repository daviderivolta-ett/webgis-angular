/** Dependencies */
import { Injectable } from '@angular/core';

/** Service */
@Injectable({
  providedIn: 'root'
})
export class TablesService {

  /** Methods */
  public parseNestedTableData(data: any[], fieldToSearch: string, keysToMerge: string[]) {
    if (!data.every(r => fieldToSearch in r)) return data;
    return data.map((r: any) => {
      if (fieldToSearch in r) {
        const { values, ...rest } = r;
        if (!Array.isArray(values)) return { ...rest, values };

        return {
          ...rest,
          ...values.reduce((acc: any, o: any) => {
            const { parameter, ...r } = o;
            const entries: [string, any][] = Object.entries(r);

            let value = ''
            keysToMerge.forEach((key: string) => {
              const pair: [string, any] | undefined = entries.find(([k, _]: [String, any]) => k === key);
              if (pair) {
                const isDate: boolean = this._isISODate(pair[1]);
                value += isDate ?
                  ` [${new Date(pair[1]).getHours().toString().padStart(2, '0')}:${new Date(pair[1]).getMinutes().toString().padStart(2, '0')}]` :
                  ` ${pair[1]}`;
              }
            });

            acc[parameter] = value;
            return acc;
          }, {})
        }
      }
    });
  }

  private _isISODate(date: string): boolean {
    if (typeof date !== 'string') return false;

    const ISO_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/;
    if (!ISO_REGEX.test(date)) return false;

    return !isNaN(new Date(date).valueOf());
  }
}