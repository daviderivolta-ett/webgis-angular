// Libraries
import { Directive, ElementRef, Renderer2 } from '@angular/core';

// Directive
@Directive({
  selector: '[scrollableTable]'
})
export class ScrollableTableDirective {

  constructor(
    private elementRef: ElementRef<HTMLDivElement>,
    private renderer: Renderer2
  ) { }

  // Directive lifecycle
  public ngAfterViewInit(): void {
    const table: HTMLTableElement | null = this.elementRef.nativeElement.querySelector('table');
    if (table) {
      this._setTableProperties(this.elementRef.nativeElement);
      this._searchHeaderCell(table);
    }
  }

  // Methods
  private _setTableProperties(container: HTMLDivElement): void {
    this.renderer.setStyle(container, 'overflowX', 'auto');
  }

  private _searchHeaderCell(table: HTMLTableElement): void {
    const firstTh: Element | null = table.querySelector('thead tr th');
    if (firstTh && firstTh instanceof HTMLTableCellElement) {
      this._makeSticky(firstTh, '0px');
    }

    const bodyRows: NodeListOf<Element> = table.querySelectorAll('tbody tr');
    bodyRows.forEach((row: Element, index: number) => {
      const firstTd: HTMLTableCellElement | null = row.querySelector('td');
      if (firstTd && firstTd instanceof HTMLTableCellElement) {
        this._makeSticky(firstTd, '0px');
      }
    });
  }

  private _makeSticky(cell: HTMLTableCellElement, left: string): void {
    this.renderer.setStyle(cell, 'position', 'sticky');
    this.renderer.setStyle(cell, 'left', left);
    this.renderer.setStyle(cell, 'z-index', '1');
  }

}