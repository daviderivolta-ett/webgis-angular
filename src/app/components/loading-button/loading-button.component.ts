/* Dependencies */
import { Component, input, ViewEncapsulation } from '@angular/core'

/* Component */
@Component({
  selector: 'app-loading-button',
  imports: [],
  templateUrl: './loading-button.component.html',
  styleUrl: './loading-button.component.scss',
  encapsulation: ViewEncapsulation.ShadowDom
})
export class LoadingButtonComponent {
  public isLoading = input<boolean>(false);
}