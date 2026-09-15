export class GeoJsonUtils {
    static isGeoJSON(json: unknown): boolean {
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

        if ('type' in json && typeof json.type === 'string' && validTypes.includes(json.type)) {
            if (json.type === 'Feature') {
                return 'geometry' in json;
            }
            if (json.type === 'FeatureCollection' && 'features' in json) {
                return Array.isArray(json.features);
            }
            return true;
        }

        return false;
    }

    static searchForGeoJSON(json: unknown): GeoJSON.FeatureCollection | undefined {
        if (!json || typeof json !== 'object' || json !== null) return;

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

    static addTypeToGeoJSONFeatures(geoJSON: GeoJSON.FeatureCollection, type: string): GeoJSON.FeatureCollection {
        return {
            ...geoJSON,
            features: geoJSON.features.map((feature: GeoJSON.Feature) => {
                const properties = feature.properties ?? {};
                return {
                    ...feature,
                    properties: {
                        ...properties,
                        type
                    }
                }
            })
        }
    }

    static addPropertiesToGeoJSONFeatures(geoJSON: GeoJSON.FeatureCollection, props: Record<string, unknown>): GeoJSON.FeatureCollection {
        return {
            ...geoJSON,
            features: geoJSON.features.map((feature: GeoJSON.Feature) => {
                const properties: Record<string, unknown> = feature.properties ?? {};
                return {
                    ...feature,
                    properties: {
                        ...properties,
                        ...props
                    }
                }
            })
        }
    }

    static fromGeoJSONToArray(geoJSON: GeoJSON.FeatureCollection): object[] {
        return geoJSON.features.map((f: GeoJSON.Feature) => {
            return f.properties
        }).filter((v) => v !== null)
    }
}