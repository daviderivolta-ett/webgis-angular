/* Dependencies */
import { Directive, ElementRef, Renderer2, AfterViewChecked, OnDestroy, inject } from '@angular/core'

/* Directive */
@Directive({
  selector: '[scrollableTable]'
})
export class ScrollableTableDirective implements AfterViewChecked, OnDestroy {
  private elementRef: ElementRef<HTMLDivElement> = inject(ElementRef);
  private renderer: Renderer2 = inject(Renderer2);

  private _unlisteners: (() => void)[] = [];

  /* Directive lifecycle */
  public ngAfterViewChecked(): void {
    const table: HTMLDivElement | null = this.elementRef.nativeElement.querySelector('.table');
    if (table) {
      this._searchHeaderCell(table);
      const thead = this._searchTableHead(table);
      const tbody = this._searchTableBody(table);
      if (thead && tbody) {
        this._setTableHeadProperties(thead);
        this._syncScroll(thead, tbody);
      }
    }
  }

  ngOnDestroy(): void {
    this._unlisteners.forEach(unlisten => unlisten());
    this._unlisteners = [];
  }

  /* Methods */
  private _setTableHeadProperties(thead: HTMLDivElement): void {
    this.renderer.setStyle(thead, 'position', 'sticky');
    this.renderer.setStyle(thead, 'top', '0');
  }

  private _searchTableHead(table: HTMLDivElement): HTMLDivElement | null {
    return table.querySelector('.thead');
  }

  private _searchTableBody(table: HTMLDivElement): HTMLDivElement | null {
    return table.querySelector('.tbody');
  }

  private _searchHeaderCell(table: HTMLDivElement): void {
    const firstTh: Element | null = table.querySelector('.thead .trow .tdata');
    if (firstTh && firstTh instanceof HTMLDivElement) {
      // this._makeSticky(firstTh, '0px');
    }

    const bodyRows: NodeListOf<Element> = table.querySelectorAll('.tbody .trow');
    bodyRows.forEach((row: Element) => {
      const firstTd: HTMLDivElement | null = row.querySelector('.tdata');
      if (firstTd && firstTd instanceof HTMLDivElement) {
        // this._makeSticky(firstTd, '0px');
      }
    });
  }

  // private _makeSticky(cell: HTMLDivElement, left: string): void {
  // this.renderer.setStyle(cell, 'position', 'sticky');
  // this.renderer.setStyle(cell, 'left', left);
  // this.renderer.setStyle(cell, 'z-index', '1');
  // }

  private _syncScroll(thead: HTMLDivElement, tbody: HTMLDivElement) {
    const unlistenThead = this.renderer.listen(thead, 'scroll', () => {
      tbody.scrollLeft = thead.scrollLeft;
    });

    const unlistenTbody = this.renderer.listen(tbody, 'scroll', () => {
      thead.scrollLeft = tbody.scrollLeft;
    });

    this._unlisteners.push(unlistenThead, unlistenTbody);
  }
}