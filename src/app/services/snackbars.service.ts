/** Dependencies */
import { Injectable, signal } from '@angular/core';

/** Models */
import { Snackbar } from '../models';

/** Services */
@Injectable({
  providedIn: 'root'
})
export class SnackbarsService {
  public snackbars = signal<Snackbar[]>([]);

  public createSnackbar(text: string, type: 'success' | 'error', isAutoDismissed: boolean = false): void {   
    const snackbar: Snackbar = new Snackbar(text, type, isAutoDismissed);  
    this.snackbars.update((oldValue: Snackbar[]) => [...oldValue, snackbar]);
  }

  public removeSnackbar(id: string): void {
    this.snackbars.update((oldValue: Snackbar[]) => {
      return oldValue.filter((s: Snackbar) => s.id !== id);
    })
  }
}
