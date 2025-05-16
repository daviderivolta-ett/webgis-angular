// Libraries
import { Component, computed, input } from '@angular/core';

// Component
@Component({
  selector: 'app-scrollable-table',
  imports: [],
  templateUrl: './scrollable-table.component.html',
  styleUrl: './scrollable-table.component.scss'
})
export class ScrollableTableComponent {
  public data = input<Object[]>([]);
  public header = computed<string[]>(() => {
    return [...new Set(this.data().flatMap((d: Object) => Object.keys(d)))];
  });
  public body = computed<[string, any][][]>(() => {
    const data: Map<string, any>[] = this._createTableData(this.data(), this.header());
    return data.map(rowMap => Array.from(rowMap.entries()));
  });

  constructor() { }

  // Methods
  private _createTableData(data: Object[], header: string[]): Map<string, any>[] {
    return data.map((d: Record<string, any>) => {
      const row: Map<string, any> = new Map<string, any>();

      header.forEach((k: string) => {
        row.set(k, Object.prototype.hasOwnProperty.call(d, k) ? d[k] : '-');
      });

      return row;
    });
  }
}