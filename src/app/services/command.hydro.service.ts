/* Dependencies */
import { inject, Injectable } from '@angular/core'

/* Models */
import { ColorScale, Command, GeoJsonLayer } from '../models'

/* Services */
import { ApiService } from './api.service'

/* Utils */
import { DateUtils, GeoJsonUtils } from '../utils'

/* Service */
@Injectable({
    providedIn: 'root'
})
export class HydroCommandService implements Command {
    /* Dependency injection */
    private apiService: ApiService = inject(ApiService);

    constructor() { }

    /* Command */
    public async execute(args?: any): Promise<void> {
        const { map, date, colorScale, layer, baseUrl, token } = args;

        try {
            if (!layer || !(layer instanceof GeoJsonLayer)) throw new Error(`Parametro 'layer' mancante od errato. Assicurati di passare al comando un layer di classe 'GeoJsonLayer'.`);
            if (!map || typeof map.addClusterPointGeoJSONLayer !== 'function') throw new Error(`Oggetto 'map' non valido o non implementa il metodo 'addCustomMarkerPointGeoJSONLayer'.`);

            const url: string = baseUrl ? this.apiService.replaceApiBaseUrl(layer.url, baseUrl) : layer.url;
            const urlWithDates: string = date ? this._createUrlWithDate(url, date) : url;
            let geoJSON: GeoJSON.FeatureCollection | GeoJSON.FeatureCollection[] = await this.apiService.getApiData(urlWithDates, token) as (GeoJSON.FeatureCollection | GeoJSON.FeatureCollection[]);
            if (Array.isArray(geoJSON)) geoJSON = this._mergeFeatureCollections(geoJSON);
            geoJSON = GeoJsonUtils.addTypeToGeoJSONFeatures(geoJSON, 'hydro');
            if (layer.parameter) geoJSON = GeoJsonUtils.addPropertiesToGeoJSONFeatures(geoJSON, { parameter: layer.parameter });

            let arcColorDict: Record<string, string> = {};

            if (colorScale instanceof ColorScale && layer.legend) {
                const labels = colorScale.labels ?? colorScale.calculateLabels();
                arcColorDict = labels.reduce((acc: Record<string, string>, curr: string, index: number) => {
                    acc[curr] = colorScale.colors[index];
                    return acc;
                }, {});
                geoJSON = this._addColorToGeoJSONFeatures(geoJSON, colorScale, arcColorDict, layer.legend.unit, layer.label);
            }

            if (geoJSON.features.length === 0) geoJSON = this._fillEmptyGeoJSON(geoJSON);

            map.addClusterPointGeoJSONLayer(layer.id, geoJSON, arcColorDict);
        } catch (error: unknown) {
            if (error instanceof Error) throw error;
            else throw new Error(`Errore nell'esecuzione del comando.`);
        }
    }

    /** Methods */
    private _addColorToGeoJSONFeatures(geoJSON: GeoJSON.FeatureCollection, colorScale: ColorScale, arcColorDict: Record<string, string>, unit: string | undefined, layerLabel: string | undefined): GeoJSON.FeatureCollection {
        return {
            ...geoJSON,
            features: geoJSON.features.map((f: GeoJSON.Feature) => {
                const properties: Record<string, unknown> = f.properties ?? {};
                const colorCode = 'alert' in properties && typeof properties['alert'] === 'number' ? properties['alert'] : undefined;
                const color: string = colorScale.getColor(colorCode ?? 0);

                return {
                    ...f,
                    properties: {
                        ...properties,
                        color,
                        unit,
                        layerLabel,
                        clusterLabel: Object.keys(arcColorDict).find((key: string) => arcColorDict[key] === color)
                    }
                }
            })

        };
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
                    }
                }
            ]
        }
    }

    private _mergeFeatureCollections(collections: GeoJSON.FeatureCollection[]): GeoJSON.FeatureCollection {
        return {
            type: 'FeatureCollection',
            features: collections.flatMap((c) => c.features || [])
        }
    }

    private _createUrlWithDate(url: string, date?: Date): string {
        const localDate = date || new Date();
        const formatted = DateUtils.toApiFormat(localDate.toISOString());
        const encodedTime = encodeURIComponent(formatted);
        return `${url}?time=${encodedTime}`;
    }
}