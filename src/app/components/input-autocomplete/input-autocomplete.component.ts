/* Dependencies */
import { Component, ElementRef, forwardRef, HostListener, input, QueryList, ViewChild, ViewChildren, ViewEncapsulation } from '@angular/core'
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms'

/* Types */
type InputType = 'text' | 'email';
type InputOption = {
  id: string;
  label?: string
}

/* Component */
@Component({
  selector: 'app-input-autocomplete',
  imports: [],
  templateUrl: './input-autocomplete.component.html',
  styleUrl: './input-autocomplete.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputAutocompleteComponent),
      multi: true
    }
  ],
  encapsulation: ViewEncapsulation.ShadowDom
})
export class InputAutocompleteComponent implements ControlValueAccessor {
  public type = input<InputType>('text');
  public placeholder = input<string>('');

  private onChange: (value: string) => void = () => { };
  private onTouched: () => void = () => { };

  public options = input<InputOption[]>([]);
  public filteredOptions: InputOption[] = [];
  public focusedOption: number = -1;

  @ViewChild('container') _container!: ElementRef<HTMLDivElement>;
  @ViewChild('input') _input!: ElementRef<HTMLInputElement>;
  @ViewChildren('option') _options!: QueryList<ElementRef<HTMLSpanElement>>;

  @HostListener('window:click', ['$event'])
  public windowClick(event: Event) {
    if (!this._container) return;
    const target = event.composedPath?.()[0] as Node;
    const isClickInside: boolean = this._container.nativeElement.contains(target);
    if (!isClickInside) this.filteredOptions = [];
  }

  /* Value accessors */
  public writeValue(value: string): void {
    this._input.nativeElement.value = value ?? '';
  }

  public registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  public registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  // Methods
  public onInputFocus = (): void => {
    this._filterOptions(this._input.nativeElement.value);
  }

  public onInputKeydown = (event: KeyboardEvent): void => {
    if (this.filteredOptions.length === 0) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (this.focusedOption < this.filteredOptions.length - 1) {
        this.focusedOption++;
        this._scrollOptionIntoView(this.focusedOption);
      }
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (this.focusedOption > 0) {
        this.focusedOption--;
        this._scrollOptionIntoView(this.focusedOption);
      }
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      if (this.focusedOption >= 0 && this.focusedOption < this.filteredOptions.length) {
        const selected: InputOption = this.filteredOptions[this.focusedOption];
        this.onOptionClick(selected.id);
        this._reset();
      }
    }
  }

  public onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this._reset();
    this._filterOptions(target.value);
    this.onChange(target.value);
  }

  private _filterOptions(search: string): void {
    this.filteredOptions = this.options().filter((option: InputOption) => {
      const searchLower: string = search.toLowerCase();
      return (
        option.id.toLowerCase().includes(searchLower) ||
        (option.label && option.label.toLowerCase().includes(searchLower))
      );
    });
  }

  public onOptionClick(value: string): void {
    this._input.nativeElement.value = value;

    this._input.nativeElement.dispatchEvent(
      new InputEvent('input', { bubbles: true, composed: true })
    );

    this._reset();
  }

  private _scrollOptionIntoView(index: number): void {
    const option = this._options.find((_, i: number) => i === index);
    option?.nativeElement.scrollIntoView({behavior: 'smooth', block: 'center'})
  }

  private _reset(): void {
    this.filteredOptions = [];
    this.focusedOption = -1;
  }
}