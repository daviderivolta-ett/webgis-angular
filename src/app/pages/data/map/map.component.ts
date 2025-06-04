/*
* Libraries
*/
import { Component, input, output } from '@angular/core';

import L from 'leaflet';
import 'leaflet-timedimension';
import 'leaflet-timedimension/dist/leaflet.timedimension.control.min.css';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

/*
* Component
*/
@Component({
  selector: 'app-map',
  imports: [],
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss'
})
export class MapComponent {
  /*
  * Class properties
  */

  /** Internal properties */
  private _map!: L.Map;
  private _layers = new Map<string, L.Layer>();

  /** Marker and cluster specific properties */
  // @ts-ignore: cluster marker plugin has no type declaration
  private _clusterGroup = L.markerClusterGroup({
    spiderfyOnMaxZoom: false,
    disableClusteringAtZoom: 15
  });
  private _markerShapes: Map<number, (...args: any[]) => SVGSVGElement> = new Map([
    [0, this._createSquareShape.bind(this)],
    [1, this._createCircleShape.bind(this)],
    [2, this._createHexagonShape.bind(this)],
    [3, this._createDiamondShape.bind(this)]
  ]);
  private _usedMarkerShapes: Set<number> = new Set();

  /** Inputs properties */
  public position = input<[number, number]>([0, 0]);
  public zoom = input<number>(0);

  /** Output properties */
  public layerAdded = output<Record<string, any>>();
  public layerRemoved = output<Record<string, any>>();

  constructor() { }

  /*
  * Getters and setters
  */
  public getMap(): L.Map { return this._map }
  public getLayers(): Map<string, L.Layer> { return this._layers }

  /*
  * Component lifecycle
  */
  public ngAfterViewInit(): void {
    this._initMap();
  }

  /*
  * Methods
  */
  private _initMap(): void {
    /** Map instance */
    this._map = new L.Map('map', {
      zoomControl: false,
      // @ts-ignore: time dimension plugin has no type declaration
      timeDimension: true,
      timeDimensionControl: true,
    })
      .setView(this.position(), this.zoom());
  }

  /** Set layer in internal map and emit event to external */
  private _registerLayer(id: string, layer: L.Layer, icon?: SVGSVGElement): void {
    this._layers.set(id, layer);
    this.layerAdded.emit({ id, layer, ...(icon ? { icon } : {}) });
  }

  private _unregisterLayer(id: string, layer: L.Layer): void {
    this._layers.delete(id);
    this.layerRemoved.emit({ id, layer });
  }

  /** Add base tile layer */
  public addBaseLayer(url: string, options: Record<string, any>): void {
    this.removeLayerById('base');
    const layer = L.tileLayer(url, { zIndex: 0, ...options }).addTo(this._map);
    this._registerLayer('base', layer);
  }

  /** Add layer  */
  public addLayer(id: string, url: string, options: Record<string, any>): void {
    const layer = L.tileLayer(url, options).addTo(this._map);
    this._registerLayer(id, layer);
  }

  /** Add WMS layer */
  public addWMSLayer(id: string, url: string, options: Record<string, any>): void {
    const layer: L.TileLayer = L.tileLayer.wms(url, options).addTo(this._map);
    this._registerLayer(id, layer);
  }

  /** Add GeoJSON layer */
  public addCustomMarkerPointGeoJSONLayer(id: string, geoJSON: GeoJSON.FeatureCollection, options?: Record<string, any>): void {
    const shapeKey: number = this._getNextAvailableMarkerShape();    
    const shapeFactory: (...args: any[]) => SVGSVGElement = this._markerShapes.get(shapeKey)!;

    const layer = L.geoJSON(geoJSON, {
      pointToLayer: (feature, latLng) => {
        const color: string = feature.properties.color ? feature.properties.color : ('#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0'));
        const shape: SVGSVGElement = shapeFactory(color);
        const html = shape.cloneNode(true) as HTMLElement;
        const divIcon = L.divIcon({ html, className: 'custom-marker' });
        const marker = L.marker(latLng, { icon: divIcon, zIndexOffset: shapeKey });
        (marker as any)._shapeKey = shapeKey; // Adding custom key in order to know which marker release when layer is removed
        return marker;
      },
      filter: (feature) => {
        return feature.geometry.type === 'Point';
      },
      ...options
    });

    // this._clusterGroup.addLayer(layer);
    // this._map.addLayer(this._clusterGroup);

    layer.addTo(this._map);
    this._registerLayer(id, layer, shapeFactory('grey'));

    // Function called when this specific GeoJSON layer is removed
    layer.on('remove', () => {
      const index: number | undefined = this._searchMarkerShapeInGeoJSONLayer(layer); // Retrieving marker custom key in order to know which key release
      if (index !== undefined) this._releaseMarkerShape(index); // comparison with 'undefined' because '0' is a valid value and js considers it 'falsy'
    });
  }

  /** Add a time dimension layer */
  public addTimeDimensionWMSLayer(id: string, url: string, options: Record<string, any>): void {
    const layer: L.TileLayer = L.tileLayer.wms(url, options);
    // @ts-ignore: time dimension plugin has no type declaration
    const timeDimensionLayer = L.timeDimension.layer.wms(layer);
    timeDimensionLayer.addTo(this._map);
    this._registerLayer(id, layer);
  }

  /** Remove layer using id */
  public removeLayerById(id: string): void {
    const layer: L.Layer | undefined = this._layers.get(id);
    if (layer) {
      this._map.removeLayer(layer);
      this._unregisterLayer(id, layer);
    }
  }

  /** Reset position and zoom to default values */
  public resetMap(): void {
    this._map.setView(this.position(), this.zoom());
  }

  /** Custom marker shapes related methods */
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

  private _searchMarkerShapeInGeoJSONLayer(layer: L.GeoJSON): number | undefined {
    const found = Array.from((layer as L.LayerGroup).getLayers()).find((l: L.Layer) => {
      const marker = l as L.Marker & { _shapeKey?: number };
      return marker._shapeKey !== undefined;
    });
    return (found as L.Marker & { _shapeKey?: number })?._shapeKey;
  }

  private _releaseMarkerShape(index: number): void {
    this._usedMarkerShapes.delete(index);
  }

  private _createCircleShape(color: string): SVGSVGElement {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 16 16');
    svg.setAttribute('width', '16');
    svg.setAttribute('height', '16');
  
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', '8');
    circle.setAttribute('cy', '8');
    circle.setAttribute('r', '8');
    circle.setAttribute('fill', color);
    svg.appendChild(circle);
    
    return svg;
  }
  

  private _createSquareShape(color: string): SVGSVGElement {
    const svgNS = 'http://www.w3.org/2000/svg';

    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('width', '16');
    svg.setAttribute('height', '16');
    svg.setAttribute('viewBox', '0 0 16 16');
  
    const rect = document.createElementNS(svgNS, 'rect');
    rect.setAttribute('x', '0');
    rect.setAttribute('y', '0');
    rect.setAttribute('width', '16');
    rect.setAttribute('height', '16');
    rect.setAttribute('fill', color);  
    svg.appendChild(rect);

    return svg;
  
  }

  private _createDiamondShape(color: string): SVGSVGElement {
    const svgNS = 'http://www.w3.org/2000/svg';

    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('width', '16');
    svg.setAttribute('height', '16');
    svg.setAttribute('viewBox', '0 0 16 16');
  
    const diamond = document.createElementNS(svgNS, 'polygon');
    diamond.setAttribute('points', '8,0 16,8 8,16 0,8');
    diamond.setAttribute('fill', color);  
    svg.appendChild(diamond);

    return svg;
  }

  private _createHexagonShape(color: string): SVGSVGElement {
    const svgNS = 'http://www.w3.org/2000/svg';

    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('width', '16');
    svg.setAttribute('height', '16');
    svg.setAttribute('viewBox', '0 0 16 16');
  
    const hex = document.createElementNS(svgNS, 'polygon');
    hex.setAttribute('points', '4,1 12,1 16,8 12,15 4,15 0,8');
    hex.setAttribute('fill', color);  
    svg.appendChild(hex);

    return svg;
  }
}