// Libraries
import { Component, input, output } from '@angular/core';

// Component
@Component({
  selector: 'app-chip',
  imports: [],
  templateUrl: './chip.component.html',
  styleUrl: './chip.component.scss'
})
export class ChipComponent {
  public id = input<string>('');
  public isDismissable = input<boolean>(true);
  public iconUrl = input<string | null>(null);
  public text = input<string>('');
  public dismiss = output<string>();

  public primaryColor = input<string>('#FFF');
  public secondaryColor = input<string>('#060527');
  public border = input<string>('1px solid #060527');

  // Methods
  public onButtonClick(): void {
    this.dismiss.emit(this.id());
  }
}