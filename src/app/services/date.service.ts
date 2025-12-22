/** Dependencies */
import { Injectable, signal } from '@angular/core';

/** Service */
@Injectable({
  providedIn: 'root'
})
export class DateService {
  /** Properties */
  public date = signal<Date | undefined>(undefined);
}