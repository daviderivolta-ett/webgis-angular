// Libraries
import { Component, input } from '@angular/core';

import L from 'leaflet';
import 'leaflet-timedimension';
import 'leaflet-timedimension/dist/leaflet.timedimension.control.min.css';

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
    this._map = new L.Map('map', {
      zoomControl: false,
      // @ts-ignore: time dimension plugin has no type declaration
      timeDimension: true,
      timeDimensionControl: true,
    })
      .setView(this.position(), this.zoom());
  }

  // Add base tile layer
  public addBaseLayer(url: string, options: Record<string, any>): void {
    this.removeLayerById('base');
    const layer = L.tileLayer(url, { zIndex: 0, ...options }).addTo(this._map);
    this._layers.set('base', layer);
  }

  // Add layer
  public addLayer(id: string, url: string, options: Record<string, any>): void {
    const layer = L.tileLayer(url, options).addTo(this._map);
    this._layers.set(id, layer);
  }

  // Add WMS layer
  public addWMSLayer(id: string, url: string, options: Record<string, any>): void {
    const layer: L.TileLayer = L.tileLayer.wms(url, options).addTo(this._map);
    this._layers.set(id, layer);
  }

  // Add a time dimension layer
  public addTimeDimensionWMSLayer(id: string, url: string, options: Record<string, any>): void {
    const layer: L.TileLayer = L.tileLayer.wms(url, options);
    // @ts-ignore: time dimension plugin has no type declaration
    const timeDimensionLayer = L.timeDimension.layer.wms(layer);
    timeDimensionLayer.addTo(this._map);
    this._layers.set(id, layer);
  }

  // Remove layer using id
  public removeLayerById(id: string): void {
    const layer: L.TileLayer | undefined = this._layers.get(id);
    if (layer) this._map.removeLayer(layer);
  }

  // Reset position and zoom to default values
  public resetMap(): void {
    this._map.setView(this.position(), this.zoom());
  }
}