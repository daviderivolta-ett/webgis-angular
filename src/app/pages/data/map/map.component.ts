/*
* Libraries
*/
import { Component, ContentChild, ElementRef, input, output } from '@angular/core';

import L, { LatLng } from 'leaflet';
import 'leaflet-timedimension';
import 'leaflet-timedimension/dist/leaflet.timedimension.control.min.css';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import '@kalisio/leaflet.donutcluster/src/Leaflet.DonutCluster.css';
import '@kalisio/leaflet.donutcluster/src/Leaflet.DonutCluster.js';

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

  /** Marker specific properties */
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
  public markerClicked = output<Record<string, any>>();

  /** User Interface */
  @ContentChild('popup', { read: ElementRef }) _popup!: ElementRef;

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
      .setView(this.position(), this.zoom())
  }

  /** Click map event */
  private _onMarkerClick(event: L.LeafletMouseEvent): void {
    const clickedLatLng: L.LatLng = event.latlng;
    const bbox = this._getLatLngBoundingBox(clickedLatLng, 100);
    const nearbyMarkers: L.Marker[] = this._getNearbyMarkers(bbox);
    console.log(nearbyMarkers);

    const geojson: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [9.2363, 44.6047]
          },
          properties: {
            name: 'Alpe Gorreto',
            municipality: 'Gorreto',
            shortCode: 'AGORR',
            refDate: '2025-06-02T21:30:00',
            value: 5,
            uom: '°C'
          }
        },
        {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [9.2363, 44.6047]
          },
          properties: {
            name: 'Alpe Gorreto',
            municipality: 'Gorreto',
            shortCode: 'AGORR',
            refDate: '2025-06-02T21:30:00',
            value: 15,
            uom: 'kn'
          }
        }
      ]
    }
    const testMarkers = geojson.features.map((f: GeoJSON.Feature) => {
      {
        if (f.geometry.type === 'Point') {
          const marker = L.marker(L.latLng(f.geometry.coordinates[1], f.geometry.coordinates[0]))
          marker.feature = {
            type: f.type,
            geometry: { ...f.geometry },
            properties: { ...f.properties }
          };
          return marker;
        } else {
          return null;
        }
      }
    }).filter((m) => m !== null);

    const data: Record<string, any> = this._getMultiMarkersData(testMarkers);
    this.markerClicked.emit(data);

    setTimeout(() => {
      if (this._popup) {
        L.popup({
          className: 'custom-leaflet-popup'
        })
          .setContent(`${this._popup.nativeElement.outerHTML}`)
          .setLatLng(nearbyMarkers[0].getLatLng())
          .openOn(this._map);
      }
    }, 0);   
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
  public addCustomMarkerPointGeoJSONLayer(id: string, geoJSON: GeoJSON.FeatureCollection, options?: Record<string, any>): void {
    const shapeKey: number = this._getNextAvailableMarkerShape();
    const shapeFactory: (...args: any[]) => SVGSVGElement = this._markerShapes.get(shapeKey)!;

    const layer = L.geoJSON(geoJSON, {
      pointToLayer: (feature, latLng) => {
        const color: string = feature.properties.color ? feature.properties.color : ('#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0'));
        const shape: SVGSVGElement = shapeFactory(color);
        const iconElement = this._scaleMarkerIcon(shape.cloneNode(true) as HTMLElement, (1 - shapeKey * 0.2));
        const iconHtml = iconElement.outerHTML; // Converting HTMLElement to string in order to avoid conflict with donut cluster plugin
        const divIcon = L.divIcon({ html: iconHtml, className: 'custom-marker', iconSize: [24, 24], iconAnchor: [12, 12] });
        const marker = L.marker(latLng, { icon: divIcon, zIndexOffset: shapeKey });
        marker.on('click', (event: L.LeafletMouseEvent) => this._onMarkerClick(event));
        (marker as any)._shapeKey = shapeKey; // Adding custom key in order to know which marker release when layer is removed
        return marker;
      },
      filter: (feature) => {
        return feature.geometry.type === 'Point';
      },
      ...options
    });

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

  /** Add GeoJSON layer with donut cluster */
  public addClusterPointGeoJSONLayer(id: string, geoJSON: GeoJSON.FeatureCollection, options?: Record<string, any>): void {
    // @ts-ignore: donut cluster plugin has no type declaration
    const markers = L.DonutCluster({ chunkedLoading: true },
      {
        key: 'title',
        arcColorDict: {
          '0': 'red',
          '5': 'blue',
          C: 'yellow',
          D: 'green'
        }
      }
    )

    const circleIcon = L.divIcon({
      html: `<div style="width:16px;height:16px;border-radius:50%;background-color:red;"></div>`,
      className: '',
      iconSize: [16, 16]
    });

    geoJSON.features.forEach((f: GeoJSON.Feature) => {
      if (f.geometry.type === 'Point') {
        const marker = L.marker(L.latLng(f.geometry.coordinates[1], f.geometry.coordinates[0]), {
          title: '5',
          icon: circleIcon
        });
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
    }
  }

  /** Reset position and zoom to default values */
  public resetMap(): void {
    this._map.setView(this.position(), this.zoom());
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

  private _createCircleShape(color: string): SVGSVGElement {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('width', '24');
    svg.setAttribute('height', '24');

    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', '12');
    circle.setAttribute('cy', '12');
    circle.setAttribute('r', '12');
    circle.setAttribute('fill', color);
    circle.setAttribute('stroke', 'white');
    svg.appendChild(circle);

    return svg;
  }

  private _createSquareShape(color: string): SVGSVGElement {
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
    rect.setAttribute('stroke', 'white');
    svg.appendChild(rect);

    return svg;

  }

  private _createDiamondShape(color: string): SVGSVGElement {
    const svgNS = 'http://www.w3.org/2000/svg';

    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('width', '24');
    svg.setAttribute('height', '24');

    const diamond = document.createElementNS(svgNS, 'polygon');
    diamond.setAttribute('points', '12,0 24,12 12,24 0,12');
    diamond.setAttribute('fill', color);
    diamond.setAttribute('stroke', 'white');
    svg.appendChild(diamond);

    return svg;
  }

  private _createHexagonShape(color: string): SVGSVGElement {
    const svgNS = 'http://www.w3.org/2000/svg';

    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('width', '24');
    svg.setAttribute('height', '24');
    svg.setAttribute('viewBox', '0 0 24 24');

    const hex = document.createElementNS(svgNS, 'polygon');
    hex.setAttribute('points', '6,2 18,2 24,12 18,22 6,22 0,12');
    hex.setAttribute('fill', color);
    svg.appendChild(hex);
    svg.setAttribute('stroke', 'white');

    return svg;
  }

  /** Clean markers data in case of multi markers click */
  private _getMultiMarkersData(markers: L.Marker[]): Record<string, any> {
    return markers.reduce((prev: Record<string, any>, curr: L.Marker) => {

      if (curr.feature && curr.feature.properties) {
        Object.keys(curr.feature.properties).forEach((k: string) => {
          if (!(k in prev)) prev[k] = curr.feature?.properties[k].toString();
          else {
            if (prev[k] !== curr.feature?.properties[k]) {
              prev[k] = [curr.feature?.properties[k].toString(), ...Array(prev[k].toString())]
            }
          }
        });
      }

      if (curr.feature && curr.feature.geometry && curr.feature.geometry.type === 'Point') {
        prev['lat'] = curr.feature.geometry.coordinates[1];
        prev['lng'] = curr.feature.geometry.coordinates[0];
      }

      return prev;
    }, {});
  }

}