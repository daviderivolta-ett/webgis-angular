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
  public isDismissable = input<boolean>(true);
  public iconUrl = input<string | null>(null);
  public text = input<string>('');
  public dismiss = output<void>();

  public primaryColor = input<string>('#FFF');
  public secondaryColor = input<string>('#060527');

  // Methods
  public onButtonClick(): void {
    this.dismiss.emit();
  }
}