import { Component, input } from '@angular/core';

@Component({
  selector: 'app-radio',
  imports: [],
  templateUrl: './radio.component.html',
  styleUrl: './radio.component.scss'
})
export class RadioComponent {
  public option = input<string>('');
  public name = input<string>('');
  public checked = input<boolean>(false);
}
