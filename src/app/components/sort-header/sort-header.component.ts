// Libraries
import { Component, input, output } from '@angular/core';

// Types
type Sort = {
  sortBy: string,
  direction: 'asc' | 'desc' | 'none'
}

// Component
@Component({
  selector: 'app-sort-header',
  imports: [],
  templateUrl: './sort-header.component.html',
  styleUrl: './sort-header.component.scss'
})
export class SortHeaderComponent {
  public direction: 'asc' | 'desc' | 'none' = 'none';
  public sortBy = input<string>('');

  public sortData = output<Sort>();

  // Methods
  public sort(value: 'asc' | 'desc' | 'none'): void {
    switch (value) {
      case 'asc':
        this.direction = 'desc';
        break;

      case 'desc':
        this.direction = 'none';
        break;

      default:
        this.direction = 'asc';
        break;
    }

    this.sortData.emit({ sortBy: this.sortBy(), direction: this.direction });
  }
}