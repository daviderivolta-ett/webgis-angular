// Libraries
import * as L from 'leaflet';
import { MapContext } from './map-context.interface';

// Class
export class LeafletMapContext implements MapContext {
    constructor(private _map: L.Map) { }

    public addGeoJSONLayer(geoJSON: GeoJSON.FeatureCollection): L.GeoJSON {
        const layer = L.geoJSON(geoJSON, {
            pointToLayer: function (feature, latLng) {
                return new L.CircleMarker(latLng, {
                    radius: 8,
                    fillColor: "#ff7800",
                    color: "#000",
                    weight: 1,
                    opacity: 1,
                    fillOpacity: 0.8
                })
            }
        });

        layer.addTo(this._map);
        return layer;
    }
}