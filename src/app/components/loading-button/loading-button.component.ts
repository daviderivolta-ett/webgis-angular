/* Dependencies */
import { Component, input, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';

/* Component */
@Component({
  selector: 'app-loading-button',
  imports: [],
  templateUrl: './loading-button.component.html',
  styleUrl: './loading-button.component.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  encapsulation: ViewEncapsulation.ShadowDom,
})
export class LoadingButtonComponent {
  public isLoading = input<boolean>(false);
}
