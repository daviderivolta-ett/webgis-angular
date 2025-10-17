export class GeoJsonUtils {
    static isGeoJSON(json: any): boolean {
        if (!json || typeof json !== 'object') return false;

        const validTypes = [
            'Feature',
            'FeatureCollection',
            'Point',
            'LineString',
            'Polygon',
            'MultiPoint',
            'MultiLineString',
            'MultiPolygon',
            'GeometryCollection',
        ];

        if (typeof json.type === 'string' && validTypes.includes(json.type)) {
            if (json.type === 'Feature') {
                return 'geometry' in json;
            }
            if (json.type === 'FeatureCollection') {
                return Array.isArray(json.features);
            }
            return true;
        }

        return false;
    }

    static searchForGeoJSON(json: any): GeoJSON.FeatureCollection | undefined {
        if (!json || typeof json !== 'object') return;

        for (const key of Object.keys(json)) {
            const value = json[key];

            if (typeof value !== 'object') continue;


            if (GeoJsonUtils.isGeoJSON(value)) {
                return value as GeoJSON.FeatureCollection;
            } else {
                const found = GeoJsonUtils.searchForGeoJSON(json[key]);
                if (found) return found;
            }

        }
        return undefined;
    }
}