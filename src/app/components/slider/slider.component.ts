/**
* Libraries
*/
import { Component, ContentChildren, ElementRef, HostListener, QueryList, ViewChild } from '@angular/core';

/**
* Component
*/
@Component({
  selector: 'app-slider',
  imports: [],
  templateUrl: './slider.component.html',
  styleUrl: './slider.component.scss'
})
export class SliderComponent {
  /**
  * Class properties
  */
  public hasHorizontalScroll: boolean = false;

  /** User Interface */
  @ViewChild('slider') _slider!: ElementRef<HTMLElement>;
  @ContentChildren('sliderItem', { read: ElementRef, descendants: true }) _elements!: QueryList<ElementRef<HTMLElement>>;

  @HostListener('window:resize', ['$event'])
  public onResize(event: UIEvent) {
    this._checkHorizontalScroll();
  }

  constructor() { }

  /**
  * Component lifecycles
  */
  public ngAfterContentInit(): void {
    this._checkHorizontalScroll();
    this._elements.changes.subscribe(() => {
      this._checkHorizontalScroll();
      this._elements.forEach((el: ElementRef<HTMLElement>) => el.nativeElement.style.scrollSnapAlign = 'center');
    });
  }

  /**
  * Methods
  */
  private _checkHorizontalScroll(): void {
    if (this._elements.length === 0) {
      this.hasHorizontalScroll = false;
      return;
    }

    const windowWidth: number = window.innerWidth;
    if (windowWidth < 768) {
      this.hasHorizontalScroll = false;
    } else {
      this.hasHorizontalScroll = (this._slider.nativeElement.scrollWidth > this._slider.nativeElement.clientWidth) ? true : false;
    }
  }

  public onArrowClick(direction: 'left' | 'right'): void {
    const elementWidth: number = 200;
    const totalWidth: number = this._slider.nativeElement.scrollWidth;
    const visibleWidth: number = this._slider.nativeElement.clientWidth;

    let newScrollPosition = this._slider.nativeElement.scrollLeft + (direction === 'left' ? -elementWidth : elementWidth);
    if (newScrollPosition < 0) newScrollPosition = 0;
    if (newScrollPosition > (totalWidth - visibleWidth)) newScrollPosition = totalWidth - visibleWidth;

    this._slider.nativeElement.scrollTo({
      left: newScrollPosition,
      behavior: 'smooth'
    });
  }
}