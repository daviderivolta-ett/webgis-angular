export interface MapContext {
    addGeoJSONLayer(geoJSON: GeoJSON.FeatureCollection): L.GeoJSON;
}