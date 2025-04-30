// Libraries
import { Component, input } from '@angular/core';

// Component
@Component({
  selector: 'app-chip',
  imports: [],
  templateUrl: './chip.component.html',
  styleUrl: './chip.component.scss'
})
export class ChipComponent {
  public isDismissable = input<boolean>(true);
  public iconUrl = input<string>('');
  public text = input<string>('');
}