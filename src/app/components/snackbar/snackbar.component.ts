/* Dependencies */
import { Component, input, output, AfterViewInit, ChangeDetectionStrategy } from '@angular/core';

/* Component */
@Component({
  selector: 'app-snackbar',
  imports: [],
  templateUrl: './snackbar.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './snackbar.component.scss',
})
export class SnackbarComponent implements AfterViewInit {
  public text = input<string>('');
  public type = input<'success' | 'error' | 'loader'>('success');
  public isAutoDismissed = input<boolean>(false);
  public btnClick = output();

  /* Component lifecycle */
  public ngAfterViewInit(): void {
    this.autoDismiss();
  }

  /* Methods */
  public autoDismiss(): void {
    if (this.isAutoDismissed()) setTimeout(() => this.btnClick.emit(), 2000);
  }
}
