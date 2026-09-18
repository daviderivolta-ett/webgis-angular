/* Dependencies */
import { Component, effect, input, output, ChangeDetectionStrategy } from '@angular/core';

/* Component */
@Component({
  selector: 'app-pop-up-menu',
  imports: [],
  templateUrl: './pop-up-menu.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './pop-up-menu.component.scss',
})
export class PopUpMenuComponent {
  public isOpen: boolean = false;

  public iconUrl = input<string>('');
  public maxHeight = input<string>('50px');
  public position = input<string>('top-right');
  public hasOverflow = input<boolean>(false);
  public backgroundColor = input<string>('#fff');
  public borderColor = input<string>('#ddd');

  public finalPosition: ['top' | 'bottom', 'left' | 'right'] = ['top', 'right'];

  public toggled = output<boolean>();

  constructor() {
    effect(() => (this.finalPosition = this._parsePosition(this.position())));
  }

  /* Methods */
  private _parsePosition(input: string): ['top' | 'bottom', 'left' | 'right'] {
    const arr: string[] = input.split('-');
    const output: ['top' | 'bottom', 'left' | 'right'] = ['top', 'right'];

    switch (arr.length) {
      case 1:
        if (arr.includes('top')) output[0] = 'top';
        if (arr.includes('bottom')) output[0] = 'bottom';
        if (arr.includes('left')) output[1] = 'left';
        if (arr.includes('right')) output[1] = 'right';
        return output;

      case 2:
        if (arr.includes('top')) {
          output[0] = 'top';
        } else {
          output[0] = 'bottom';
        }

        if (arr.includes('left')) {
          output[1] = 'left';
        } else {
          output[1] = 'right';
        }

        return output;

      default:
        return ['top', 'right'];
    }
  }

  public togglePopUpMenu(value: boolean): void {
    this.isOpen = value;
    this.toggled.emit(value);
  }
}
