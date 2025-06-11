/** Libraries */
import { Component, effect, input } from '@angular/core';
import { DatePipe } from '@angular/common';

/** Pipes */
import { IsArrayPipe, IsDatePipe } from '../../../pipes';

/** Component */
@Component({
  selector: 'app-map-popup',
  imports: [
    DatePipe,
    IsArrayPipe,
    IsDatePipe
  ],
  templateUrl: './map-popup.component.html',
  styleUrl: './map-popup.component.scss'
})
export class MapPopupComponent {
  public data = input<Record<string, any>>({});

  constructor() { }
}