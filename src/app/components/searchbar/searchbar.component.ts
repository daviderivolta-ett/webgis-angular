/** Libraries */
import { Component, ContentChild, ElementRef, ViewEncapsulation } from '@angular/core';

/** Component */
@Component({
  selector: 'app-searchbar',
  imports: [],
  templateUrl: './searchbar.component.html',
  styleUrl: './searchbar.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class SearchbarComponent {
  @ContentChild('input') _inputRef?: ElementRef<HTMLInputElement>;

  constructor() { }

  /** Component lifecycle */
  public ngAfterContentInit(): void {
    if (!this._inputRef) console.warn('Elemento input non presente all\'interno del componente \'app-searchbar\'. Inserire un input con reference #input, ngProjectAs="searchbar-input".');
  }

  /** Methods */  
  public onEmptyBtnClick(): void {
    if (this._inputRef?.nativeElement) {
      const input: HTMLInputElement = this._inputRef.nativeElement;
      input.value = '';
      input.dispatchEvent(new Event('input'));
    }
  }
}
