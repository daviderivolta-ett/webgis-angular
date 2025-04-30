// Libraries
import { Component } from '@angular/core';

import L from 'leaflet';

// Component
@Component({
  selector: 'app-map',
  imports: [],
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss'
})
export class MapComponent {
  private _map!: L.Map;

  constructor() { }

  // Component lifecycle
  public ngAfterViewInit(): void {
    this._initMap();
  }

  // Methods
  private _initMap(): void {
    // Map instance
    this._map = new L.Map('map', {
      zoomControl: false
    })
      .setView([44.40370599796929, 8.928584505583844], 9);

    // Add base layer
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this._map);
  }
}