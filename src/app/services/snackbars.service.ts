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

  public createSnackbar(text: string, type: 'success' | 'error' | 'loader', isAutoDismissed: boolean = false, id?: string): string {   
    const snackbar: Snackbar = new Snackbar(text, type, isAutoDismissed, id);   
    this.snackbars.update((oldValue: Snackbar[]) => [...oldValue, snackbar]);
    return snackbar.id;
  }

  public removeSnackbar(id: string): void {
    this.snackbars.update((oldValue: Snackbar[]) => {
      return oldValue.filter((s: Snackbar) => s.id !== id);
    })
  }
}
