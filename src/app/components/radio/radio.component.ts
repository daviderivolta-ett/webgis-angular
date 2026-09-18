/* Dependencies */
import { Component, input, ChangeDetectionStrategy } from '@angular/core';

/* Component */
@Component({
  selector: 'app-radio',
  imports: [],
  templateUrl: './radio.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './radio.component.scss',
})
export class RadioComponent {
  public option = input<string>('');
  public name = input<string>('');
  public checked = input<boolean>(false);
}
