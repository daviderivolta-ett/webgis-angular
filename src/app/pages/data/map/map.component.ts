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
  private _layers = new Map<string, L.Layer>();

  private _markerShapes: Map<number, HTMLElement> = new Map([
    [0, this._createCircleShape()],
    [1, this._createSquareShape()],
    [2, this._createDiamondShape()]
  ]);
  private _usedMarkerShapes: Set<number> = new Set();

  public position = input<[number, number]>([0, 0]);
  public zoom = input<number>(0);

  constructor() { }

  // Getters and setters
  public getMap(): L.Map { return this._map }
  public getLayers(): Map<string, L.Layer> { return this._layers }

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

    // this._map.on('layeradd', (event) => console.log(event.layer));
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

  // Add GeoJSON layer
  public addGeoJSONLayer(id: string, geoJSON: GeoJSON.FeatureCollection, options?: Record<string, any>): void {
    const shapeKey: number = this._getNextAvailableMarkerShape();
    const shape: HTMLElement = this._markerShapes.get(shapeKey)!;

    const layer = L.geoJSON(geoJSON, {
      pointToLayer: (feature, latLng) => {
        const html = shape.cloneNode(true) as HTMLElement;
        const divIcon = L.divIcon({ html, className: 'custom-marker' });
        return L.marker(latLng, { icon: divIcon, zIndexOffset: shapeKey });
      },
      ...options
    });
    layer.addTo(this._map);
    this._layers.set(id, layer);

    layer.on('remove', () => this._releaseMarkerShape(shape));
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
    const layer: L.Layer | undefined = this._layers.get(id);
    if (layer) {
      this._map.removeLayer(layer);
      this._layers.delete(id);
    }
  }

  // Reset position and zoom to default values
  public resetMap(): void {
    this._map.setView(this.position(), this.zoom());
  }

  // Custom marker shapes
  private _getNextAvailableMarkerShape(): number {
    for (let i = 0; i < this._markerShapes.size; i++) {
      if (!this._usedMarkerShapes.has(i)) {
        this._usedMarkerShapes.add(i);
        return i;
      }
    }

    this._usedMarkerShapes.clear();
    this._usedMarkerShapes.add(0);
    return 0;
  }

  private _releaseMarkerShape(shape: HTMLElement): void {
    const index = Array.from(this._markerShapes.values()).indexOf(shape);
    if (index !== -1) {
      this._usedMarkerShapes.delete(index);
    }
  }

  private _createCircleShape(): HTMLElement {
    const html = document.createElement('div');
    html.style.backgroundColor = 'crimson';
    html.style.border = 'none';
    html.style.borderRadius = '100%';
    html.style.height = '16px';
    html.style.width = '16px';
    return html;
  }

  private _createSquareShape(): HTMLElement {
    const html = document.createElement('div');
    html.style.backgroundColor = 'blue';
    html.style.border = 'none';
    html.style.height = '16px';
    html.style.width = '16px';
    return html;
  }

  private _createDiamondShape(): HTMLElement {
    const html = document.createElement('div');
    html.style.backgroundColor = 'blue';
    html.style.border = 'none';
    html.style.height = '16px';
    html.style.aspectRatio = '1';
    html.style.clipPath = 'polygon(50% 0,100% 50%,50% 100%,0 50%)';
    html.style.backgroundColor = 'green';
    return html;
  }
}