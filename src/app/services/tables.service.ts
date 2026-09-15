/* Dependencies */
import { Injectable } from '@angular/core';

/* Service */
@Injectable({
  providedIn: 'root'
})
export class TablesService {

  /* Methods */
  public filterNestedTableData(data: object[], fieldsToKeep: string[]): object[] {
    if (fieldsToKeep.length === 0 || !data.every(r => r !== null && typeof r === 'object')) return data;

    return data.map(d =>
      Object.fromEntries(
        Object.entries(d as Record<string, unknown>)
          .filter(([key]) => fieldsToKeep.includes(key))
      )
    );
  }

  public mergeTableDataRowsByParam(data: unknown[], groupBy: string, fieldsToMerge: string[]): object[] {
    return data.reduce((acc: Record<string, unknown>[], curr: unknown) => {
      const current = curr as Record<string, unknown>;

      let found = acc.find(item => item[groupBy] === current[groupBy]);

      if (!found) {
        found = { [groupBy]: current[groupBy] };
        acc.push(found);
      }

      const index =
        Object.keys(found)
          .filter(k => fieldsToMerge.some(f => k.startsWith(f)))
          .length / fieldsToMerge.length + 1;

      fieldsToMerge.forEach(field => {
        found[`${field}${index}`] = current[field];
      });

      return acc;
    }, []);
  }


  public parseNestedTableData2(data: any[], fieldToSearch: string, keysToMerge: string[], hiddenKey: string) {
    if (!data.every(r => fieldToSearch in r)) return data;
    return data.map((r: any) => {
      if (fieldToSearch in r) {
        const values = r[fieldToSearch];
        const rest = { ...r };
        delete rest[fieldToSearch];

        if (!Array.isArray(values)) return { ...rest };
        return [
          ...Object.entries(rest).map(([k, v]: [any, any]) => ({
            dataKey: k,
            dataValue: v,
            hiddenValue: undefined
          })),
          ...values.map((d: any) => {
            const { ...r } = d;
            const entries: [string, any][] = Object.entries(r);

            let value: string = '';
            keysToMerge.forEach((key: string) => {
              const pair: [string, any] | undefined = entries.find(([k,]: [string, any]) => k === key);
              if (pair) {
                const isDate: boolean = this._isISODate(pair[1]);
                value += isDate ?
                  ` [${new Date(pair[1]).getHours().toString().padStart(2, '0')}:${new Date(pair[1]).getMinutes().toString().padStart(2, '0')}]` :
                  ` ${pair[1]}`;
              }
            });

            return {
              dataKey: d['parameter'],
              dataValue: value,
              hiddenvalue: d[hiddenKey]
            }
          })
        ]
      }
    })
  }

  public parseNestedTableData(data: any[], fieldToSearch: string, keysToMerge: string[], multiplier?: number): any[] {
    if (!data.every(r => fieldToSearch in r)) {
      return data.map((r: any) => {
        if (!multiplier) return r;
        return Object.fromEntries(
          Object.entries(r).map(([k, v]) => {
            if (typeof v !== 'number') return [k, v];
            return [k, v * multiplier];
          })
        )
      })
    }

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
              const pair: [string, any] | undefined = entries.find(([k,]: [string, any]) => k === key);
              if (pair) {
                const isDate: boolean = this._isISODate(pair[1]);
                value += isDate ?
                  ` [${new Date(pair[1]).getHours().toString().padStart(2, '0')}:${new Date(pair[1]).getMinutes().toString().padStart(2, '0')}]` :
                  ` ${pair[1] * (multiplier ?? 1)}`;
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