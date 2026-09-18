/* Dependencies */
import { Component, input, ChangeDetectionStrategy } from '@angular/core';

/* Component */
@Component({
  selector: 'app-tab',
  imports: [],
  templateUrl: './tab.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './tab.component.scss',
})
export class TabComponent {
  public tabId = input<string>('');
  public isVisible: boolean = false;
}
