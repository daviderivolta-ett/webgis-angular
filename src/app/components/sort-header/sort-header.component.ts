// Libraries
import { Component, input } from '@angular/core';

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
  }
}