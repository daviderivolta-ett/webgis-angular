// Libraries
import * as L from 'leaflet';

// Models
import { MapContext } from './map-context.interface';

// Class
export class LeafletMapContext implements MapContext {
    private _shapes: Map<number, HTMLElement> = new Map([
        [0, this._createCircleShape()],
        [1, this._createSquareShape()],
        [2, this._createDiamondShape()]
    ]);

    constructor(private _map: L.Map) { }

    public addGeoJSONLayer(geoJSON: GeoJSON.FeatureCollection, options?: L.GeoJSONOptions, zIndex: number = 0): L.GeoJSON {
        const layer = L.geoJSON(geoJSON, {
            pointToLayer: (feature, latLng) => {
                const shape: HTMLElement | undefined = this._shapes.get(zIndex);
                const html: HTMLElement = shape ? shape.cloneNode(true) as HTMLElement : this._shapes.get(0)!.cloneNode(true) as HTMLElement;
                const divIcon = L.divIcon({ html, className: 'custom-marker' });
                return L.marker(latLng, { icon: divIcon });
            },
            ...options
        });

        layer.addTo(this._map);
        return layer;
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