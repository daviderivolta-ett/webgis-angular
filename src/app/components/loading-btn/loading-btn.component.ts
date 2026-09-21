/* Dependencies */
import {
  Component,
  ContentChild,
  ElementRef,
  input,
  Renderer2,
  ViewChild,
  AfterViewInit,
  inject
} from '@angular/core';

/* Component */
@Component({
  selector: 'app-loading-btn',
  imports: [],
  templateUrl: './loading-btn.component.html',

  styleUrl: './loading-btn.component.scss',
})
export class LoadingBtnComponent implements AfterViewInit {
  private renderer: Renderer2 = inject(Renderer2);

  public isLoading = input<boolean>(false);

  public cssProps = input<string[]>([]);

  @ContentChild('button', { read: ElementRef }) _projectedBtn!: ElementRef<HTMLButtonElement>;
  @ViewChild('fakeBtn', { static: true }) _fakeBtn!: ElementRef<HTMLButtonElement>;

  constructor() {}

  /* Component lifecycle */
  ngAfterViewInit(): void {
    const style: CSSStyleDeclaration = getComputedStyle(this._projectedBtn.nativeElement);
    for (let i = 0; i < style.length; i++) {
      const propName = style[i];
      if (
        this.cssProps().includes(propName) ||
        propName === 'display' ||
        propName === 'cursor' ||
        propName === 'opacity'
      )
        continue;
      const propValue = style.getPropertyValue(propName);
      this.renderer.setStyle(this._fakeBtn.nativeElement, propName, propValue);
    }
  }
}
