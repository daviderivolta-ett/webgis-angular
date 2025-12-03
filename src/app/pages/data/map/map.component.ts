/*
* Libraries
*/
import { Component, ContentChild, ElementRef, input, model, NgZone, output } from '@angular/core';
import { Feature, Point } from 'geojson';

import 'leaflet-timedimension';
import 'leaflet-timedimension/dist/leaflet.timedimension.control.min.css';

import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

import '@kalisio/leaflet.donutcluster/src/Leaflet.DonutCluster.js';
import '@kalisio/leaflet.donutcluster/src/Leaflet.DonutCluster.css';

import * as L from 'leaflet';

/** Components */
import { TimePlayerComponent } from '../time-player/time-player.component';
import { MapPopupComponent } from '../map-popup/map-popup.component';

/*
* Component
*/
@Component({
  selector: 'app-map',
  imports: [
    TimePlayerComponent
  ],
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
  private _hoverTimer: number = 0;

  /** Time dimension properties */
  public isTimeDimensionVisible = input<boolean>(false);
  public isLoading = model<boolean>(false);
  private _selectedDate: Date | undefined = undefined;

  /** Marker specific properties */
  private _markerShapes: Map<number, (...args: any[]) => SVGSVGElement> = new Map([
    [0, this._createSquareShape.bind(this)],
    [1, this._createCircleShape.bind(this)],
    [2, this._createHexagonShape.bind(this)],
    [3, this._createDiamondShape.bind(this)],
    [4, this._createDownTriangleShape.bind(this)],
    [5, this._createUpTriangleShape.bind(this)],
    [6, this._createWindBarbShape.bind(this)]
  ]);

  private _usedMarkerShapes: Set<number> = new Set();

  /** Inputs properties */
  public position = input<[number, number]>([0, 0]);
  public zoom = input<number>(0);
  public maxBounds = input<[number, number][]>([[0, 0], [0, 0]]);
  public minZoom = input<number>(0);
  public maxClusterRadius = input<number>(0);

  /** Output properties */
  public layerAdded = output<Record<string, any>>();
  public layerRemoved = output<Record<string, any>>();
  public mapClicked = output<Record<string, any>>();
  public markerClicked = output<Record<string, any>[]>();
  public dateChanged = output<Date | undefined>();
  public popupClicked = output<any[]>();

  /** User Interface */
  @ContentChild('popup') _popup!: MapPopupComponent;
  @ContentChild('popup', { read: ElementRef }) _popupElement!: ElementRef;

  constructor(private ngZone: NgZone) { }

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
      // timeDimensionControl: true
    })
      .addControl(new L.Control.Zoom({ position: 'bottomleft' }))
      .setView(this.position(), this.zoom())
      .setMaxBounds(this.maxBounds())
      .setMinZoom(this.minZoom())

    // Map event to trigger WMS layers GetFeatureInfo
    this._map.on('click', (e: L.LeafletMouseEvent) => this._onMapClick(e));

    // @ts-ignore: time dimension plugin has no type declaration
    this._map.timeDimension.on('timeload', () => this.isLoading.set(false));
    // @ts-ignore: time dimension plugin has no type declaration
    this._map.timeDimension.on('timeloading', () => this.isLoading.set(true));

    // @ts-ignore: time dimension plugin has no type declaration
    this._map.timeDimension.on('availabletimeschanged', () => {
      requestAnimationFrame(() => {
        if (this._selectedDate) this._setCurrentTime(this._selectedDate);
      })
    });
  }

  /** Click map event */
  private _onMarkerClick(event: L.LeafletMouseEvent): void {
    const clickedLatLng: L.LatLng = event.latlng;
    const bbox = this._getLatLngBoundingBox(clickedLatLng, 100);
    const nearbyMarkers: L.Marker[] = this._getNearbyMarkers(bbox);

    if (nearbyMarkers.length === 0) return;

    const result = this._getMultiMarkersData(nearbyMarkers, 'group');
    let data: Record<string, any>[];
    data = Array.isArray(result) ? result : [result];

    this.markerClicked.emit(data);

    if (this._popup && this._popupElement) {
      const subscription = this.ngZone.onStable.subscribe(() => {
        const popup: L.Popup = this.openCustomPopup(this._popupElement.nativeElement, nearbyMarkers[0].getLatLng());

        const btn: HTMLButtonElement | undefined | null = popup.getElement()?.querySelector('#map-popup-btn');
        btn?.addEventListener('click', () => this.popupClicked.emit(this._popup.data()));

        popup.on('remove', () => {
          btn?.removeEventListener('click', () => this.popupClicked.emit(this._popup.data()));
        });

        subscription.unsubscribe();
      });
    }
  }

  private _onMapClick(e: L.LeafletMouseEvent) {
    if (!this._map.options.crs) return;
    const bbox = this._map.getBounds().toBBoxString();
    const size = { width: this._map.getSize().x, height: this._map.getSize().y };
    const point = { x: Math.floor(e.containerPoint.x), y: Math.floor(e.containerPoint.y) }
    const latLng = { lat: e.latlng.lat, lng: e.latlng.lng };
    this.mapClicked.emit({ bbox, point, size, latLng });
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

  public haslayer(id: string): boolean {
    return this._layers.has(id);
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
    const layer: L.TileLayer = L.tileLayer.wms(url, {
      opacity: options['opacity'] ?? 1,
      ...options
    }).addTo(this._map);
    this._registerLayer(id, layer);
  }

  /** Add GeoJSON layer */
  public addCustomMarkerPointGeoJSONLayer(id: string, geoJSON: GeoJSON.FeatureCollection, options?: Record<string, any>, preferredShape?: number): void {
    const shapeKey: number = preferredShape ?? this._getNextAvailableMarkerShape();
    const shapeFactory: (...args: any[]) => SVGSVGElement = this._markerShapes.get(shapeKey)!;
    const layer = L.geoJSON(geoJSON, {
      pointToLayer: (feature, latLng) => {
        const color: string = feature.properties.color ?? 'grey';
        const value: number | undefined = feature.properties.value;
        const extraValue: number | undefined = feature.properties.extraValue;
        const shape: SVGSVGElement = feature.properties.markerShapeId ?
          this._markerShapes.get(feature.properties.markerShapeId)!(color, '#000', { value, extraValue }) :
          shapeFactory(color, '#000', { value, extraValue });
        const iconElement = this._scaleMarkerIcon(shape.cloneNode(true) as HTMLElement, (1 - shapeKey * 0.2));
        const iconHtml = iconElement.outerHTML; // Converting HTMLElement to string in order to avoid conflict with donut cluster plugin
        const divIcon = L.divIcon({
          html: iconHtml,
          className: 'custom-marker',
          iconSize: feature.properties.markerShapeId !== 6 ? [20, 20] : [64, 64],
          iconAnchor: feature.properties.markerShapeId !== 6 ? [10, 10] : [32, 32]
        });
        const marker = L.marker(latLng, { icon: divIcon, zIndexOffset: shapeKey });
        marker.on('mouseover', (event: L.LeafletMouseEvent) => this._hoverTimer = window.setTimeout(() => this._onMarkerClick(event), 300));
        marker.on('mouseout', () => window.clearTimeout(this._hoverTimer));
        marker.on('click', () => this.popupClicked.emit(this._popup.data()));
        (marker as any)._shapeKey = shapeKey; // Adding custom key in order to know which marker release when layer is removed
        return marker;
      },
      filter: (feature) => {
        return feature.geometry.type === 'Point';
      },
      ...options
    });

    layer.addTo(this._map);
    this._registerLayer(id, layer,
      geoJSON.features.length > 0 ?
        geoJSON.features[0].properties?.['markerShapeId'] === 6 ? this._markerShapes.get(1)!('grey', 'grey') : shapeFactory('grey', 'transparent') :
        shapeFactory('grey', 'transparent')
    );

    // Function called when this specific GeoJSON layer is removed
    layer.on('remove', () => {
      const index: number | undefined = this._searchMarkerShapeInGeoJSONLayer(layer); // Retrieving marker custom key in order to know which key release     
      if (index !== undefined) this._releaseMarkerShape(index); // comparison with 'undefined' because '0' is a valid value and js considers it 'falsy'
    });
  }

  /** Add a time dimension layer */
  public addTimeDimensionWMSLayer(id: string, url: string, options: Record<string, any>): void {
    const layer: L.TileLayer = L.tileLayer.wms(url, {
      ...options,
      // @ts-ignore
      setDefaultTime: false
    });
    // @ts-ignore: time dimension plugin has no type declaration
    const timeDimensionLayer = L.timeDimension.layer.wms(layer);
    try {
      timeDimensionLayer.addTo(this._map);
    } catch (error: unknown) {
      throw new Error(error instanceof Error ? error.message : `Errore nell'aggiunta del layer alla mappa.`);
    }
    this._registerLayer(id, timeDimensionLayer);
  }


  public addGeoJSONLayer(id: string, geoJSON: GeoJSON.FeatureCollection): void {
    const geoJSONLayer: L.GeoJSON = L.geoJSON(geoJSON, {
      style: (feature) => {
        if (!feature) return {}

        console.log();
        
        const color: string = feature.properties.color ?? 'grey';
        const opacity: number = feature.properties.opacity ?? 1;
        return {
          color: '#000',
          weight: 2,
          opacity,
          fillColor: color
        }
      }
    }).addTo(this._map);
    this._registerLayer(id, geoJSONLayer);
  }

  /** Add GeoJSON layer with donut cluster */
  public addClusterPointGeoJSONLayer(id: string, geoJSON: GeoJSON.FeatureCollection, arcColorDict: Record<string, string>, options?: Record<string, any>): void {
    // Create pane for cluster
    // Useful to handle zIndex fight between cluster and custom markers
    if (!this._map.getPane('cluster')) {
      this._map.createPane('cluster').style.zIndex = '699'; // 700 is the popup default zIndex
    }

    // @ts-ignore: donut cluster plugin has no type declaration
    const markers = L.DonutCluster({
      chunkedLoading: true,
      clusterPane: 'cluster',
      maxClusterRadius: this.maxClusterRadius(),
    }, {
      key: 'title',
      arcColorDict,
      style: {
        size: 40,
        fill: '#bbb',
        opacity: 1,
        weight: 7
      },
    });

    geoJSON.features.forEach((f: GeoJSON.Feature) => {

      if (f.geometry.type === 'Point') {
        const icon = this._createCircleShape((f.properties && f.properties['color']) ?? '#B0B0B0', '#000', { opacity: 1 });
        const iconElement = this._scaleMarkerIcon(icon.cloneNode(true) as HTMLElement, 0.9);
        const marker = L.marker(L.latLng(f.geometry.coordinates[1], f.geometry.coordinates[0]), {
          title: (f.properties && f.properties['clusterLabel']) ?? Object.keys(arcColorDict)[0],
          icon: L.divIcon({ html: iconElement.outerHTML, className: '', iconSize: [16, 16] })
        });
        if (f.geometry.type === 'Point') marker.feature = f as Feature<Point>;
        marker.on('mouseover', (event: L.LeafletMouseEvent) => this._onMarkerClick(event));
        marker.on('click', () => this.popupClicked.emit(this._popup.data()));
        markers.addLayer(marker);
      }

    });

    this._map.addLayer(markers);
    this._registerLayer(id, markers);
  }

  /** Remove layer using id */
  public removeLayerById(id: string): void {
    const layer: L.Layer | undefined = this._layers.get(id);
    if (layer) {
      this._map.removeLayer(layer);
      this._unregisterLayer(id, layer);
      // @ts-ignore: time dimension plugin has no type declaration
      if (layer._timeDimension) this._resetTimeDimension();
    }
  }

  /** Reset position and zoom to default values */
  public resetMap(): void {
    this._map.setView(this.position(), this.zoom());
  }

  /** Time dimension methods */
  public onTimePlayerToggle(date: Date | undefined): void {
    this._selectedDate = date;
    this.dateChanged.emit(date);

    if (date) {
      this._setCurrentTime(date);
    } else {
      // @ts-ignore: time dimension plugin has no type declaration
      const availableTimes: numbers[] = this._map.timeDimension.getAvailableTimes();
      availableTimes.length > 0 ? this._setCurrentTime(availableTimes[availableTimes.length - 1]) : this._resetTimeDimension();
    }
  }

  private _resetTimeDimension(): void {
    // @ts-ignore: time dimension plugin has no type declaration
    this._map.timeDimension.setAvailableTimes([], 'replace');
    // @ts-ignore: time dimension plugin has no type declaration
    this._map.timeDimension.setCurrentTime(0);
  }

  private _setCurrentTime(date: Date | number): void {
    // @ts-ignore: time dimension plugin has no type declaration
    this._map.timeDimension.setCurrentTime(date instanceof Date ? date.getTime() : date);
  }

  private _nextTime(): void {
    // @ts-ignore: time dimension plugin has no type declaration
    this._map.timeDimension.nextTime();
  }

  private _previousTime(): void {
    // @ts-ignore: time dimension plugin has no type declaration
    this._map.timeDimension.previousTime();
  }

  /** Popup methods */
  public openCustomPopup(element: string | HTMLElement, coordinates: L.LatLngExpression): L.Popup {
    return L.popup({
      className: 'custom-leaflet-popup',
      autoPan: false
    })
      .setContent(element instanceof HTMLElement ? `${element.outerHTML}` : element)
      .setLatLng(coordinates)
      .openOn(this._map)
  }

  public closeAllPopups(): void {
    this._map.closePopup();
  }

  /** Util function to create a bounding box around a specific point at a certain distance */
  private _getLatLngBoundingBox(center: L.LatLng, tolerance: number = 50): L.LatLngBounds {
    const latAccuracy = tolerance / 111320; // Lat degrees per N meters (~constant)
    const lngAccuracy = tolerance / (40075000 * Math.cos(center.lat * Math.PI / 180) / 360); // Fix lat cos
    const southWest = L.latLng(center.lat - latAccuracy, center.lng - lngAccuracy);
    const northEast = L.latLng(center.lat + latAccuracy, center.lng + lngAccuracy);
    return L.latLngBounds(southWest, northEast);
  }

  private _getNearbyMarkers(bbox: L.LatLngBounds) {
    const nearbyMarkers: L.Marker[] = [];
    this._map.eachLayer((layer: L.Layer) => {
      if (layer instanceof L.Marker && bbox.contains(layer.getLatLng())) nearbyMarkers.push(layer);
    });
    return nearbyMarkers;
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

  private _scaleMarkerIcon(html: HTMLElement, scale: number): HTMLElement {
    html.style.transform = `scale(${scale})`;
    html.style.transformOrigin = 'center center';
    html.style.display = 'inline-block';
    html.style.width = '100%';
    html.style.height = '100%';
    return html;
  }

  private _createCircleShape(color: string, borderColor: string, options: Record<string, any> = {}): SVGSVGElement {
    const { opacity } = options;

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('width', '24');
    svg.setAttribute('height', '24');

    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', '12');
    circle.setAttribute('cy', '12');
    circle.setAttribute('r', '11');
    circle.setAttribute('fill', color);
    circle.setAttribute('fill-opacity', opacity ? opacity.toString() : '1');
    circle.setAttribute('stroke', borderColor);
    circle.setAttribute('stroke-width', '2');
    svg.appendChild(circle);

    return svg;
  }

  private _createSquareShape(color: string, borderColor: string, options: Record<string, any> = {}): SVGSVGElement {
    const { opacity } = options;

    const svgNS = 'http://www.w3.org/2000/svg';

    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('width', '24');
    svg.setAttribute('height', '24');

    const rect = document.createElementNS(svgNS, 'rect');
    rect.setAttribute('x', '0');
    rect.setAttribute('y', '0');
    rect.setAttribute('width', '24');
    rect.setAttribute('height', '24');
    rect.setAttribute('fill', color);
    rect.setAttribute('fill-opacity', opacity ? opacity.toString() : '1');
    rect.setAttribute('stroke', borderColor);
    rect.setAttribute('stroke-width', '2');
    svg.appendChild(rect);

    return svg;
  }

  private _createDiamondShape(color: string, borderColor: string, options: Record<string, any> = {}): SVGSVGElement {
    const { opacity } = options;

    const svgNS = 'http://www.w3.org/2000/svg';

    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('width', '24');
    svg.setAttribute('height', '24');

    const diamond = document.createElementNS(svgNS, 'polygon');
    diamond.setAttribute('points', '12,0 24,12 12,24 0,12');
    diamond.setAttribute('fill', color);
    diamond.setAttribute('fill-opacity', opacity ? opacity.toString() : '1');
    diamond.setAttribute('stroke', borderColor);
    diamond.setAttribute('stroke-width', '2');
    svg.appendChild(diamond);

    return svg;
  }

  private _createHexagonShape(color: string, borderColor: string, options: Record<string, any> = {}): SVGSVGElement {
    const { opacity } = options;

    const svgNS = 'http://www.w3.org/2000/svg';

    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('width', '24');
    svg.setAttribute('height', '24');
    svg.setAttribute('viewBox', '0 0 24 24');

    const hex = document.createElementNS(svgNS, 'polygon');
    hex.setAttribute('points', '6,2 18,2 24,12 18,22 6,22 0,12');
    hex.setAttribute('fill', color);
    hex.setAttribute('fill-opacity', opacity ? opacity.toString() : '1');
    hex.setAttribute('stroke', borderColor);
    hex.setAttribute('stroke-width', '2');
    svg.appendChild(hex);

    return svg;
  }

  private _createDownTriangleShape(color: string, borderColor: string, options: Record<string, any> = {}) {
    const { opacity } = options;

    const svgNS = 'http://www.w3.org/2000/svg';

    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('width', '24');
    svg.setAttribute('height', '24');
    svg.setAttribute('viewBox', '0 0 24 24');

    const triangle = document.createElementNS(svgNS, 'polygon');
    triangle.setAttribute('points', '0,0 24,0 12,24');
    triangle.setAttribute('fill', color);
    triangle.setAttribute('fill-opacity', opacity ? opacity.toString() : '1');
    triangle.setAttribute('stroke', borderColor);
    triangle.setAttribute('stroke-width', '2');
    svg.appendChild(triangle);

    return svg;
  }

  private _createUpTriangleShape(color: string, borderColor: string, options: Record<string, any> = {}) {
    const { opacity } = options;

    const svgNS = 'http://www.w3.org/2000/svg';

    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('width', '24');
    svg.setAttribute('height', '24');
    svg.setAttribute('viewBox', '0 0 24 24');

    const triangle = document.createElementNS(svgNS, 'polygon');
    triangle.setAttribute('points', '0,24 24,24 12,0');
    triangle.setAttribute('fill', color);
    triangle.setAttribute('fill-opacity', opacity ? opacity.toString() : '1');
    triangle.setAttribute('stroke', borderColor);
    triangle.setAttribute('stroke-width', '2');
    svg.appendChild(triangle);

    return svg;
  }

  private _createWindBarbShape(color: string, borderColor: string, options: Record<string, any> = {}) {
    const { opacity, value: speed, extraValue: angle } = options;

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 64 64');
    svg.setAttribute('width', '64');
    svg.setAttribute('height', '64');

    if (speed > 0) {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', '32');
      line.setAttribute('y1', '32');
      line.setAttribute('x2', '32');
      line.setAttribute('y2', '4');
      line.setAttribute('stroke', borderColor);
      line.setAttribute('stroke-width', '2');
      line.setAttribute('stroke-linecap', 'round');
      line.setAttribute('transform', `rotate(${angle ? angle : '0'} 32 32)`);
      svg.appendChild(line);

      if (speed > 1.8 && speed < 10.8) {
        const halfBarb = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        halfBarb.setAttribute('x1', '32');
        halfBarb.setAttribute('y1', '14');
        halfBarb.setAttribute('x2', '39');
        halfBarb.setAttribute('y2', '10');
        halfBarb.setAttribute('stroke', borderColor);
        halfBarb.setAttribute('stroke-width', '2');
        halfBarb.setAttribute('stroke-linecap', 'round');
        halfBarb.setAttribute('transform', `rotate(${angle ? angle : '0'} 32 32)`);
        svg.appendChild(halfBarb);
      }

      if (speed > 10.8) {
        const firstBarb = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        firstBarb.setAttribute('x1', '32');
        firstBarb.setAttribute('y1', '4');
        firstBarb.setAttribute('x2', '39');
        firstBarb.setAttribute('y2', '0');
        firstBarb.setAttribute('stroke', borderColor);
        firstBarb.setAttribute('stroke-width', '2');
        firstBarb.setAttribute('stroke-linecap', 'round');
        firstBarb.setAttribute('transform', `rotate(${angle ? angle : '0'} 32 32)`);
        svg.appendChild(firstBarb);
      }

      if (speed > 18) {
        const secondBarb = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        secondBarb.setAttribute('x1', '32');
        secondBarb.setAttribute('y1', '9');
        secondBarb.setAttribute('x2', speed > 28 ? '39' : '35.5');
        secondBarb.setAttribute('y2', speed > 28 ? '5' : '7');
        secondBarb.setAttribute('stroke', borderColor);
        secondBarb.setAttribute('stroke-width', '2');
        secondBarb.setAttribute('stroke-linecap', 'round');
        secondBarb.setAttribute('transform', `rotate(${angle ? angle : '0'} 32 32)`);
        svg.appendChild(secondBarb);
      }

      if (speed > 36) {
        const thirdBarb = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        thirdBarb.setAttribute('x1', '32');
        thirdBarb.setAttribute('y1', '14');
        thirdBarb.setAttribute('x2', speed > 46.8 ? '39' : '35.5');
        thirdBarb.setAttribute('y2', speed > 46.8 ? '10' : '12');
        thirdBarb.setAttribute('stroke', borderColor);
        thirdBarb.setAttribute('stroke-width', '2');
        thirdBarb.setAttribute('stroke-linecap', 'round');
        thirdBarb.setAttribute('transform', `rotate(${angle ? angle : '0'} 32 32)`);
        svg.appendChild(thirdBarb);
      }

      if (speed > 54) {
        const fourthBarb = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        fourthBarb.setAttribute('x1', '32');
        fourthBarb.setAttribute('y1', '19');
        fourthBarb.setAttribute('x2', speed > 64.8 ? '39' : '35.5');
        fourthBarb.setAttribute('y2', speed > 64.8 ? '15' : '17');
        fourthBarb.setAttribute('stroke', borderColor);
        fourthBarb.setAttribute('stroke-width', '2');
        fourthBarb.setAttribute('stroke-linecap', 'round');
        fourthBarb.setAttribute('transform', `rotate(${angle ? angle : '0'} 32 32)`);
        svg.appendChild(fourthBarb);
      }

    }

    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', '32');
    circle.setAttribute('cy', '32');
    circle.setAttribute('r', '7');
    circle.setAttribute('fill', color);
    circle.setAttribute('fill-opacity', opacity ? opacity.toString() : '1');
    circle.setAttribute('stroke', borderColor);
    circle.setAttribute('stroke-width', '2');
    svg.appendChild(circle);

    return svg;
  }

  /** Clean markers data in case of multi markers click */
  private _getMultiMarkersData(markers: L.Marker[], mode: 'merge' | 'group' = 'merge'): Record<string, any> | Record<string, any>[] {
    if (mode === 'group') {
      // Group mode: return and object array, an object per marker
      return markers.map(marker => {
        const props = marker.feature?.properties || {};
        const geom = marker.feature?.geometry;
        const latlng = geom?.type === 'Point'
          ? { lat: geom.coordinates[1], lng: geom.coordinates[0] }
          : {};
        return { ...props, ...latlng };
      });
    }

    // Merge mode: aggregate data in an object
    return markers.reduce((acc: Record<string, any>, curr: L.Marker) => {
      const props = curr.feature?.properties;
      const geom = curr.feature?.geometry;

      if (props) {
        for (const key of Object.keys(props)) {
          const value = props[key];
          if (!(key in acc)) acc[key] = value;
          else if (acc[key] !== value) {
            if (!Array.isArray(acc[key])) acc[key] = [acc[key]];
            if (!acc[key].includes(value)) acc[key].push(value);
          }
        }
      }

      if (geom?.type === 'Point') this._findAndSetCoordinates(acc, geom);

      return acc;
    }, {});
  }

  private _findAndSetCoordinates(object: Record<string, any>, geom: GeoJSON.Point) {
    const [lng, lat] = geom.coordinates;
    if (!('lat' in object)) object['lat'] = lat;
    else if (object['lat'] !== lat) {
      object['lat'] = Array.isArray(object['lat']) ? object['lat'] : [object['lat']];
      if (!object['lat'].includes(lat)) object['lat'].push(lat);
    }

    if (!('lng' in object)) object['lng'] = lng;
    else if (object['lng'] !== lng) {
      object['lng'] = Array.isArray(object['lng']) ? object['lng'] : [object['lng']];
      if (!object['lng'].includes(lng)) object['lng'].push(lng);
    }
  }
}