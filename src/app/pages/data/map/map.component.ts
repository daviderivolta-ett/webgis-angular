// Libraries
import { Component, input, signal } from '@angular/core';

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
  private _layers = new Map<string, L.TileLayer>();

  public position = input<[number, number]>([0, 0]);
  public zoom = input<number>(0);

  constructor() { }

  // Component lifecycle
  public ngAfterViewInit(): void {
    this._initMap();
  }

  // Methods
  private _initMap(): void {
    // Map instance
    this._map = new L.Map('map', { zoomControl: false })
      .setView(this.position(), this.zoom());

    // Add base layer
    // L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    //   attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    // }).addTo(this._map);
  }

  // Add base layer fomr external
  public addBaseLayer(url: string, options: Record<string, any>): void {
    this.removeLayerById('base');
    const layer = L.tileLayer(url, { zIndex: 0, ...options }).addTo(this._map);
    this._layers.set('base', layer);
  }

  // Add layer from external
  public addLayer(id: string, url: string, options: Record<string, any>): void {
    const layer = L.tileLayer(url, options).addTo(this._map);
    this._layers.set(id, layer);
  }

  // Add WMSLayer from external
  public addWMSLayer(id: string, url: string, options: Record<string, any>): void {
    const layer: L.TileLayer = L.tileLayer.wms(url, options).addTo(this._map);
    this._layers.set(id, layer);
  }

  // Remove layer form external using id
  public removeLayerById(id: string): void {
    const layer: L.TileLayer | undefined = this._layers.get(id);
    if (layer) this._map.removeLayer(layer);
  }
}