/* Dependencies */
import { inject, Injectable } from '@angular/core'

/* Models */
import { ColorScale, Command, FeatureFilter, GeoJsonLayer, MarkerCondition, MarkerMapping } from '../models'

/* Services */
import { ApiService } from './api.service'

/* Utils */
import { DateUtils, GeoJsonUtils } from '../utils'

/* Service */
@Injectable({
    providedIn: 'root'
})
export class LightningCommandService implements Command {
    /* Dependency injection */
    private apiService: ApiService = inject(ApiService);

    /* Command */
    public async execute(args: any): Promise<void> {        
        const { map, date, colorScale, layer, baseUrl, token } = args;

        try {
            if (!layer || !(layer instanceof GeoJsonLayer)) throw new Error(`Parametro 'layer' mancante od errato. Assicurati di passare al comando un layer di classe 'GeoJsonLayer'.`);
            if (!map || typeof map.addClusterPointGeoJSONLayer !== 'function') throw new Error(`Oggetto 'map' non valido o non implementa il metodo 'addCustomMarkerPointGeoJSONLayer'.`);

            const url: string = baseUrl ? this.apiService.replaceApiBaseUrl(layer.url, baseUrl) : layer.url;
            const urlWithDates: string = date ? this._createUrlWithDate(url, date) : this._createUrlWithDate(url, new Date());
            let geoJSON: GeoJSON.FeatureCollection | GeoJSON.FeatureCollection[] = await this.apiService.getApiData(urlWithDates, token) as (GeoJSON.FeatureCollection | GeoJSON.FeatureCollection[]);

            if (Array.isArray(geoJSON)) geoJSON = this._mergeFeatureCollections(geoJSON);
            if (layer.filter) geoJSON = this._filterFeatures(geoJSON, layer.filter);
            geoJSON = GeoJsonUtils.addTypeToGeoJSONFeatures(geoJSON, 'lightning');
            if ('decimals' in layer && typeof layer.decimals === 'number') geoJSON = GeoJsonUtils.addPropertiesToGeoJSONFeatures(geoJSON, { decimals: layer.decimals });

            let arcColorDict: Record<string, string> = {};

            if (colorScale instanceof ColorScale && layer.legend) {
                const labels = colorScale.labels ?? colorScale.calculateLabels();
                arcColorDict = labels.reduce((acc: Record<string, string>, curr: string, index: number) => {
                    acc[curr] = colorScale.colors[index];
                    return acc;
                }, {});
                geoJSON = this._addColorToGeoJSONFeaturesByDate(geoJSON, date ?? new Date(), colorScale, arcColorDict, layer.legend.unit, layer.label);
            }           

            if (layer.markers) geoJSON = this._addMarkerShapeIdToGeoJSONFeatures(geoJSON, layer.markers);
            if (geoJSON.features.length === 0) geoJSON = this._fillEmptyGeoJSON(geoJSON);

            map.addClusterPointGeoJSONLayer(layer.id, geoJSON, arcColorDict);
        } catch (error: unknown) {
            if (error instanceof Error) throw error;
            else throw new Error(`Errore nell'esecuzione del comando.`);
        }
    }

    /* Methods */
    private _filterFeatures(geoJSON: GeoJSON.FeatureCollection, filter: FeatureFilter): GeoJSON.FeatureCollection {
        return {
            ...geoJSON,
            features: geoJSON.features.filter((feature: GeoJSON.Feature) => {
                const properties: Record<string, unknown> = feature.properties ?? {};
                const featureProperty: any = properties[filter.featureProperty];

                switch (filter.rule.comparisonOperator) {
                    case '<': if (featureProperty < filter.rule.value) return true; break;
                    case '<=': if (featureProperty <= filter.rule.value) return true; break;
                    case '>': if (featureProperty > filter.rule.value) return true; break;
                    case '>=': if (featureProperty >= filter.rule.value) return true; break;
                    case '===': if (featureProperty === filter.rule.value) return true; break;
                    case '!==': if (featureProperty !== filter.rule.value) return true; break;
                }

                return false;
            })
        }
    }

    private _addColorToGeoJSONFeaturesByDate(geoJSON: GeoJSON.FeatureCollection, date: Date, colorScale: ColorScale, arcColorDict: Record<string, string>, unit: string | undefined, layerLabel: string | undefined): GeoJSON.FeatureCollection {
        const now: number = date.getTime();
        
        return {
            ...geoJSON,
            features: geoJSON.features.map((f: GeoJSON.Feature) => {
                const properties: any = f.properties ?? {};
                const date = new Date(properties['referenceDate']);
                const timestamp: number = date.getTime();
                const elapsedMs: number = now - timestamp;
                const elapsedHours: number = (elapsedMs / (1000 * 60 * 60));
                const color: string = colorScale.getColor(elapsedHours);

                /* TESTING */
                // const scaleTimes = colorScale.labels?.map((label) => this._parseTimeToMinutes(label)).toReversed() ?? [];
                // const elapsedMinutes: number = (elapsedMs / (1000 * 60));
                // const index = scaleTimes?.findIndex((time: number) => elapsedMinutes <= time);
                // const foundColor = colorScale.colors.toReversed()[index === -1 ? (colorScale.colors.length - 1) : (index - 1)];
                /* TESTING */

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

    private _addMarkerShapeIdToGeoJSONFeatures(geoJSON: GeoJSON.FeatureCollection, markers: MarkerMapping): GeoJSON.FeatureCollection {
        return {
            ...geoJSON,
            features: geoJSON.features.map((feature: GeoJSON.Feature) => {
                const properties: Record<string, unknown> = feature.properties ?? {};
                const featureProperty: any = properties[markers.featureProperty];
                const markerShapeId: number = this._getMarkerShapeFromRule(typeof featureProperty === 'number' ? Math.abs(featureProperty) : featureProperty, markers.rules, 0);

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

    private _createUrlWithDate(url: string, date: Date): string {
        const time = DateUtils.toApiFormat(date.toISOString());
        const separator = url.includes('?') ? '&' : '?';
        return `${url}${separator}time=${time}`;
    }



    private _parseTimeToMinutes(label: string): number {
        const regexp: RegExp = /\d+|[a-zA-Z]+|[^a-zA-Z\d]+/g;
        const elements: RegExpMatchArray | null = label.match(regexp);
        if (!elements) return 0;
        switch (elements[1]) {
            case 'h':
                return parseInt(elements[0]) * 60;
            case '\'':
                return parseInt(elements[0])
            default:
                return 0
        }
    }
}