/** Dependencies */
import { Component, input, output } from '@angular/core';

/** Component */
@Component({
  selector: 'app-snackbar',
  imports: [],
  templateUrl: './snackbar.component.html',
  styleUrl: './snackbar.component.scss'
})
export class SnackbarComponent {
  public text = input<string>('');
  public type = input<'success' | 'error'>('success');
  public isAutoDismissed = input<boolean>(false);
  public onBtnClicked = output();

  /** Component lifecycle */
  public ngAfterViewInit(): void {
    this.autoDismiss();
  }

  /** Methods */
  public autoDismiss(): void {
    if (this.isAutoDismissed()) setTimeout(() => this.onBtnClicked.emit(), 2000);
  }
}
