export interface MapAdapter {
    addClusterPointGeoJSONLayer(id: string, geoJSON: GeoJSON.FeatureCollection, options?: Record<string, any>): void;
    addCustomMarkerPointGeoJSONLayer(id: string, geoJSON: GeoJSON.FeatureCollection, options?: Record<string, any>): void;
    addWMSLayer(id: string, url: string, options: Record<string, any>): void;
}