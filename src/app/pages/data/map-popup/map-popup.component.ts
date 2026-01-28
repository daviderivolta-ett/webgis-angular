/** Libraries */
import { Component, input, output } from '@angular/core'
import { DatePipe } from '@angular/common'

/** Models */
import { createDefaultStationsPopupConfig, Station, StationPopupConfig } from '../../../models'

/** Component */
@Component({
  selector: 'app-map-popup',
  imports: [
    DatePipe
  ],
  templateUrl: './map-popup.component.html',
  styleUrl: './map-popup.component.scss'
})
export class MapPopupComponent {
  public data = input<Station[]>([]);
  public config = input<StationPopupConfig>(createDefaultStationsPopupConfig());
  public btnClicked = output<void>();
}