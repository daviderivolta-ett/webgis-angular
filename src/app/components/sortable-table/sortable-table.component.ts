// Libraries
import { Component, ContentChildren, QueryList } from '@angular/core';

// Component
import { SortHeaderComponent } from '../sort-header/sort-header.component';

// Component
@Component({
  selector: 'app-sortable-table',
  imports: [],
  templateUrl: './sortable-table.component.html',
  styleUrl: './sortable-table.component.scss'
})
export class SortableTableComponent {
  @ContentChildren(SortHeaderComponent, { descendants: true }) _sortheaders!: QueryList<SortHeaderComponent>;

  // Component lifecycles
  public ngAfterContentInit(): void {
    this._sortheaders.forEach((header: SortHeaderComponent) => {
      header.sortData.subscribe((value) => this._resetAllSortHeaders(value.sortBy));
    });
  }

  // Methods
  private _resetAllSortHeaders(id: string): void {
    this._sortheaders.forEach((header: SortHeaderComponent) => {
      if (header.sortBy() !== id) header.direction = 'none';
    });
  }
}