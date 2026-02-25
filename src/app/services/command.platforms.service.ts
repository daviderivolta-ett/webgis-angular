/** Dependencies */
import { Injectable } from '@angular/core'

/** Models */
import { ColorScale, Command, GeoJsonLayer, MarkerCondition, MarkerMapping, Sensor, StationBase } from '../models'

/** Services */
import { ApiService } from './api.service'

/** Utils */
import { DateUtils, GeoJsonUtils } from '../utils'

/** Service */
@Injectable({
    providedIn: 'root'
})
export class PlatformsCommandService implements Command {
    constructor(private apiService: ApiService) { }

    /** Command */
    public async execute(args?: any): Promise<void> {
        const { map, date, colorScale, layer, baseUrl, stations, token, timeSpan, timeThreshold, sensorTypes, showValueOnZoom } = args;

        try {
            if (!layer || !(layer instanceof GeoJsonLayer)) throw new Error(`Parametro 'layer' mancante od errato. Assicurati di passare al comando un layer di classe 'GeoJsonLayer'.`);
            if (!map || typeof map.addCustomMarkerPointGeoJSONLayer !== 'function') throw new Error(`Oggetto 'map' non valido o non implementa il metodo 'addCustomMarkerPointGeoJSONLayer'.`);

            const url: string = baseUrl ? this.apiService.replaceApiBaseUrl(layer.url, baseUrl) : layer.url;
            const urlWithDates: string = date ? this._createUrlWithDate(url, date, timeSpan) : this._createUrlWithDate(url, new Date(), timeSpan);
            let geoJSON: GeoJSON.FeatureCollection = await this.apiService.getApiData(urlWithDates, token);
            geoJSON = this._filterPlatforms(geoJSON);
            geoJSON = this._filterStations(geoJSON, stations, layer.parameter);
            geoJSON = GeoJsonUtils.addTypeToGeoJSONFeatures(geoJSON, layer.action['type'] ?? 'platform');

            if ('decimals' in layer && typeof layer.decimals === 'number') geoJSON = GeoJsonUtils.addPropertiesToGeoJSONFeatures(geoJSON, { decimals: layer.decimals });

            if (layer.multiplier) geoJSON = this._convertGeoJSONData(geoJSON, layer.multiplier);
            geoJSON = this._truncateGeoJSONData(geoJSON, layer.decimals);
            if (colorScale instanceof ColorScale && layer.legend) {
                if (sensorTypes && Array.isArray(sensorTypes)) {
                    const currentSensorType = sensorTypes.find((s) => s.id === layer.parameter);
                    if (currentSensorType && 'thresholdKeys' in currentSensorType) geoJSON = this._addColorToGeoJSONFeatures(geoJSON, colorScale, layer.legend.unit, layer.label, date ?? new Date(), timeThreshold, currentSensorType.thresholdKeys, stations, currentSensorType['baseColor']);
                } else {
                    geoJSON = this._addColorToGeoJSONFeatures(geoJSON, colorScale, layer.legend.unit, layer.label, date ?? new Date(), timeThreshold);
                }
            }
            if (layer.parameter) geoJSON = GeoJsonUtils.addPropertiesToGeoJSONFeatures(geoJSON, { parameter: layer.parameter });
            if (layer.markers) geoJSON = this._addMarkerShapeIdToGeoJSONFeatures(geoJSON, layer.markers);

            if (geoJSON.features.length === 0) geoJSON = this._fillEmptyGeoJSON(geoJSON);
            map.addCustomMarkerPointGeoJSONLayer(layer.id, geoJSON, { ...layer }, token ? undefined : 1, showValueOnZoom);
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

    private _filterStations(geoJSON: GeoJSON.FeatureCollection, stations: StationBase[], param?: string): GeoJSON.FeatureCollection {
        if (!param) return geoJSON;

        return {
            ...geoJSON,
            features: geoJSON.features.filter((v: GeoJSON.Feature) => {
                const station: StationBase | undefined = stations.find((s) => s.id === v.properties?.['stationCode']);
                if (!station) return v;
                else {
                    const sensor: Sensor | undefined = station.sensors.find((s) => s.type === param);
                    return sensor?.enabled ? v : undefined;
                }
            }).filter((v) => v !== undefined)
        }
    }

    private _addColorToGeoJSONFeatures(geoJSON: GeoJSON.FeatureCollection, colorScale: ColorScale, unit: string | undefined, layerLabel: string | undefined, currentDate?: Date, timeThreshold?: number, thresholdKeys?: string[], stations?: StationBase[], baseColor?: string): GeoJSON.FeatureCollection {
        return {
            ...geoJSON,
            features: geoJSON.features.map((feature: GeoJSON.Feature) => {
                const properties: any = feature.properties ?? {};
                const date: Date = new Date(properties['referenceDate']);

                const value: any = properties['value'];
                let color: string = colorScale.getColor(colorScale.multiplier ? colorScale.multiplier * value : value);
                if (stations && thresholdKeys) color = this._getRelativeColor(value, properties['stationCode'], stations, thresholdKeys, baseColor) ?? color;

                if (currentDate && !isNaN(date.getTime()) && timeThreshold) {
                    const isWithin = (currentDate.getTime() - date.getTime()) < timeThreshold * 60 * 1000;
                    if (!isWithin) color = 'grey';
                }

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

    private _getRelativeColor(value: number, stationCode: string, stations: StationBase[], thresholdKeys: string[], baseColor: string | undefined): string | undefined {
        const station: StationBase | undefined = stations.find((s) => s.id === stationCode);

        const thresholds: Record<string, number> = {};
        if (thresholdKeys && station && station.thresholdConfig) {
            thresholdKeys.forEach((key: string) => {
                if (key in (station?.thresholdConfig ?? {})) {
                    thresholds[key] = (station.thresholdConfig as any)?.[key];
                }
            });
        }

        if (Object.keys(thresholds).length > 0) {
            const colors = baseColor ? [baseColor, ...Object.keys(thresholds)] : Object.keys(thresholds);
            const values = Object.values(thresholds);
            const index = values.findIndex((step: number) => value <= step);
            return index === -1 ? colors[colors.length - 1] : colors[index];
        }

        return;
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

    private _fillEmptyGeoJSON(geoJSON: GeoJSON.FeatureCollection): GeoJSON.FeatureCollection {
        return {
            ...geoJSON,
            features: [
                {
                    type: 'Feature',
                    geometry: {
                        type: 'Point',
                        coordinates: [0, 0]
                    },
                    properties: {
                        color: 'transparent'
                    },
                    bbox: [0, 0, 0, 0]
                }
            ]
        }
    }

    private _convertGeoJSONData(geoJSON: GeoJSON.FeatureCollection, multiplier: number) {
        return {
            ...geoJSON,
            features: geoJSON.features.map((feature: GeoJSON.Feature) => {
                const properties: any = feature.properties ?? {};
                const value: any = properties['value'];

                return {
                    ...feature,
                    properties: {
                        ...properties,
                        value: (value !== undefined) ? (value * multiplier) : undefined
                    }
                }
            })

        }
    }

    private _truncateGeoJSONData(geoJSON: GeoJSON.FeatureCollection, decimals: number = 1): GeoJSON.FeatureCollection {
        return {
            ...geoJSON,
            features: geoJSON.features.map((feature: GeoJSON.Feature) => {
                const properties: any = feature.properties ?? {};
                const value: any = properties['value'];
                const factor = 10 ** decimals;

                return {
                    ...feature,
                    properties: {
                        ...properties,
                        value: (value !== undefined) ? Math.trunc(value * factor) / factor : undefined
                    }
                }
            })
        }
    }

    private _getMarkerShapeFromRule(value: string | number, markers: MarkerCondition[], defaultShapeId: number = 0): number {
        for (const marker of markers) {
            switch (marker.comparisonOperator) {
                case '<': if (typeof value === 'number' && typeof marker.threshold === 'number' && value < marker.threshold) return marker.shapeId; break;
                case '<=': if (typeof value === 'number' && typeof marker.threshold === 'number' && value <= marker.threshold) return marker.shapeId; break;
                case '>': if (typeof value === 'number' && typeof marker.threshold === 'number' && value > marker.threshold) return marker.shapeId; break;
                case '>=': if (typeof value === 'number' && typeof marker.threshold === 'number' && value >= marker.threshold) return marker.shapeId; break;
                case '===': if (value === marker.threshold) return marker.shapeId; break;
                case '!==': if (value !== marker.threshold) return marker.shapeId; break;
            }
        }
        return defaultShapeId;
    }

    private _createUrlWithDate(url: string, date: Date, minuteSpan: number = 60): string {
        const span: number = minuteSpan * 60 * 1000;

        const fromLocal = new Date(date.getTime() - span);
        const toLocal = new Date(date.getTime());

        const fromDate = DateUtils.toApiFormat(fromLocal.toISOString());
        const toDate = DateUtils.toApiFormat(toLocal.toISOString());

        const separator = url.includes('?') ? '&' : '?';

        return `${url}${separator}fromDate=${fromDate}&toDate=${toDate}&creationDate=${toDate}`;
    }
}