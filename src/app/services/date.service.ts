/** Dependencies */
import { Injectable } from '@angular/core';

/** Service */
@Injectable({
  providedIn: 'root'
})
export class DateService {
  /** Properties */
  private _date: Date | undefined;

  /** Getter and setter */
  public get date(): Date | undefined { return this._date }
  public set date(value: Date | undefined) { this._date = value }
}