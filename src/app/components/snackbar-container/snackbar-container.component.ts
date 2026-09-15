/* Dependencies */
import { Component, effect, inject } from '@angular/core'

/* Models */
import { Snackbar } from '../../models'

/* Services */
import { SnackbarsService } from '../../services'

/* Components */
import { SnackbarComponent } from '../snackbar/snackbar.component'

/* Component */
@Component({
  selector: 'app-snackbar-container',
  imports: [SnackbarComponent],
  templateUrl: './snackbar-container.component.html',
  styleUrl: './snackbar-container.component.scss'
})
export class SnackbarContainerComponent {
  private snackbarsServices: SnackbarsService = inject(SnackbarsService);
  
  public snackbars: Snackbar[] = [];

  constructor() {
    effect(() => this.snackbars = this.snackbarsServices.snackbars());
  }

  public onSnackbarBtnClick(snackbarId: string): void {
    this.snackbarsServices.removeSnackbar(snackbarId);
  }
}
