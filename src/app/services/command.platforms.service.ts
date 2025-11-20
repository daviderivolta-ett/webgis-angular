/** Dependencies */
import { Injectable } from '@angular/core'

/** Models */
import { ColorScale, Command, GeoJsonLayer, MarkerCondition, MarkerMapping } from '../models'

/** Services */
import { ApiService } from './api.service'

/** Utils */
import { GeoJsonUtils } from '../utils'

/** Service */
@Injectable({
    providedIn: 'root'
})
export class PlatformsCommandService implements Command {
    constructor(private apiService: ApiService) { }

    /** Command */
    public async execute(args?: any): Promise<void> {
        const { map, date, colorScale, layer, baseUrl, token, timeSpan } = args;

        try {
            if (!layer || !(layer instanceof GeoJsonLayer)) throw new Error(`Parametro 'layer' mancante od errato. Assicurati di passare al comando un layer di classe 'GeoJsonLayer'.`);
            if (!map || typeof map.addCustomMarkerPointGeoJSONLayer !== 'function') throw new Error(`Oggetto 'map' non valido o non implementa il metodo 'addCustomMarkerPointGeoJSONLayer'.`);

            const url: string = baseUrl ? this.apiService.replaceApiBaseUrl(layer.url, baseUrl) : layer.url;
            const urlWithDates: string = date ? this._createUrlWithDate(url, date, timeSpan) : this._createUrlWithDate(url, new Date(), timeSpan);
            let geoJSON: GeoJSON.FeatureCollection = await this.apiService.getApiData(urlWithDates, token);
            geoJSON = this._filterPlatforms(geoJSON);
            geoJSON = GeoJsonUtils.addTypeToGeoJSONFeatures(geoJSON, 'platform');

            if (colorScale instanceof ColorScale && layer.legend) geoJSON = this._addColorToGeoJSONFeatures(geoJSON, colorScale, layer.legend.unit, layer.label);
            if (layer.parameter) geoJSON = GeoJsonUtils.addPropertiesToGeoJSONFeatures(geoJSON, { parameter: layer.parameter });
            if (layer.markers) geoJSON = this._addMarkerShapeIdToGeoJSONFeatures(geoJSON, layer.markers);

            if (geoJSON.features.length === 0) throw new Error('Non sono presenti dati.', { cause: 404 });

            map.addCustomMarkerPointGeoJSONLayer(layer.id, geoJSON, { ...layer }, token ? undefined : 1);
        } catch (error) {
            if (error instanceof Error) throw error;
            else throw new Error(`Errore nell'esecuzione del comando.`);
        }
    }

    /** Methods */
    private _filterPlatforms(geoJSON: GeoJSON.FeatureCollection): GeoJSON.FeatureCollection {
        const map = new Map<string, GeoJSON.Feature>();

        for (const feature of geoJSON.features) {
            const code = feature.properties?.['stationCode'];
            const dateStr = feature.properties?.['referenceDate'];

            if (!code || !dateStr) continue;

            const current = map.get(code);
            const newDate = new Date(dateStr);

            if (!current) {
                map.set(code, feature);
            } else {
                const currentDate = new Date(current.properties?.['referenceDate']);
                if (newDate > currentDate) {
                    map.set(code, feature);
                }
            }
        }

        return {
            ...geoJSON,
            features: Array.from(map.values())
        };
    }


    private _addColorToGeoJSONFeatures(geoJSON: GeoJSON.FeatureCollection, colorScale: ColorScale, unit: string | undefined, layerLabel: string | undefined): GeoJSON.FeatureCollection {
        return {
            ...geoJSON,
            features: geoJSON.features.map((feature: GeoJSON.Feature) => {
                const properties: any = feature.properties ?? {};
                const value: any = properties['value'];
                const color: string = colorScale.getColor(value);
                return {
                    ...feature,
                    properties: {
                        ...properties,
                        unit,
                        color,
                        layerLabel
                    }
                };
            })
        };
    }

    private _addMarkerShapeIdToGeoJSONFeatures(geoJSON: GeoJSON.FeatureCollection, markers: MarkerMapping): GeoJSON.FeatureCollection {
        return {
            ...geoJSON,
            features: geoJSON.features.map((feature: GeoJSON.Feature) => {
                const properties: any = feature.properties ?? {};
                const featureProperty: any = properties[markers.featureProperty];
                const markerShapeId: number = this._getMarkerShapeFromRule(featureProperty, markers.rules, 0);
                return {
                    ...feature,
                    properties: {
                        ...properties,
                        markerShapeId
                    }
                }
            })
        }
    }

    private _getMarkerShapeFromRule(value: number, markers: MarkerCondition[], defaultShapeId: number = 0): number {
        for (const marker of markers) {
            switch (marker.comparisonOperator) {
                case '<': if (value < marker.threshold) return marker.shapeId; break;
                case '<=': if (value <= marker.threshold) return marker.shapeId; break;
                case '>': if (value > marker.threshold) return marker.shapeId; break;
                case '>=': if (value >= marker.threshold) return marker.shapeId; break;
                case '===': if (value === marker.threshold) return marker.shapeId; break;
                case '!==': if (value !== marker.threshold) return marker.shapeId; break;
            }
        }
        return defaultShapeId;
    }

    private _createUrlWithDate(url: string, date: Date, minuteSpan: number = 60): string {
        const span = minuteSpan * 60 * 1000;
        const fromDate = this.apiService.formatDate(new Date(date.getTime() - span));
        const toDate = this.apiService.formatDate(new Date(date.getTime()));
        const separator = url.includes('?') ? '&' : '?';
        return `${url}${separator}fromDate=${fromDate}&toDate=${toDate}`;
    }
}