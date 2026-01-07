/** Dependencies */
import { Injectable } from '@angular/core';

/** Service */
@Injectable({
  providedIn: 'root'
})
export class TablesService {

  /** Methods */
  public filterNestedTableData(data: any[], fieldsToKeep: string[]): any[] {
    if (!data.every(r => typeof r === 'object')) return data;
    return data.map((d: any) => {
      // const arr = Object.entries(d).filter((e: [string, unknown]) => fieldsToKeep.includes(e[0]))
      // return Object(arr);

      const result: Record<string, any> = {};
      Object.entries(d).forEach(([k, v]: [string, any]) => {
        if (fieldsToKeep.includes(k)) result[k] = v;
      })
      return result;
    });
  }

  public mergeTableDataRowsByParam(data: any[], param: string): any[] {
    return data.reduce((acc: any[], curr: any) => {
      let found = acc.find((c) => c[param] === curr[param]);
      if (!found) {
        found = { [param]: curr[param] };
        acc.push(found);
      }

      const nameIndex = Object.keys(found).filter(k => k.startsWith('name')).length + 1;
      found[`name${nameIndex}`] = curr.name;

      return acc;
    }, [] as any[]);
  }

  public parseNestedTableData(data: any[], fieldToSearch: string, keysToMerge: string[]): any[] {
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