/* Dependencies */
import { Component, input } from '@angular/core'

/* Component */
@Component({
  selector: 'app-tab',
  imports: [],
  templateUrl: './tab.component.html',
  styleUrl: './tab.component.scss'
})
export class TabComponent {
  public tabId = input<string>('');
  public isVisible: boolean = false;
}