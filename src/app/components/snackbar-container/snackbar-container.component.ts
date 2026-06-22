/** Dependencies */
import { Component, effect } from '@angular/core';

/** Models */
import { Snackbar } from '../../models';

/** Services */
import { SnackbarsService } from '../../services';

/** Components */
import { SnackbarComponent } from '../snackbar/snackbar.component';

/** Component */
@Component({
  selector: 'app-snackbar-container',
  imports: [SnackbarComponent],
  templateUrl: './snackbar-container.component.html',
  styleUrl: './snackbar-container.component.scss'
})
export class SnackbarContainerComponent {
  public snackbars: Snackbar[] = [];

  constructor(private snackbarsServices: SnackbarsService) {
    effect(() => this.snackbars = this.snackbarsServices.snackbars());
  }

  public onSnackbarBtnClick(snackbarId: string): void {
    this.snackbarsServices.removeSnackbar(snackbarId);
  }
}
