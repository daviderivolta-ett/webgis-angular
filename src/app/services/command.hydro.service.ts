/** Dependencies */
import { Injectable } from '@angular/core'

/** Models */
import { ColorScale, Command, GeoJsonLayer } from '../models'

/** Services */
import { ApiService } from './api.service'

/** Service */
@Injectable({
    providedIn: 'root'
})
export class HydroCommandService implements Command {
    constructor(private apiService: ApiService) { }

    /** Command */
    public async execute(args?: any): Promise<void> {
        const { map, date, colorScale, layer, token } = args;

        try {
            if (!layer || !(layer instanceof GeoJsonLayer)) throw new Error(`Parametro 'layer' mancante od errato. Assicurati di passare al comando un layer di classe 'GeoJsonLayer'.`);
            if (!map || typeof map.addClusterPointGeoJSONLayer !== 'function') throw new Error(`Oggetto 'map' non valido o non implementa il metodo 'addCustomMarkerPointGeoJSONLayer'.`);
            const url = this._createUrlWithDate(layer.url, date);

            let geoJSON: GeoJSON.FeatureCollection | GeoJSON.FeatureCollection[] = await this.apiService.getApiData(url, token);
            if (Array.isArray(geoJSON)) geoJSON = this._mergeFeatureCollections(geoJSON);

            let arcColorDict: Record<string, string> = {};

            if (colorScale instanceof ColorScale && layer.legend) {
                const labels = colorScale.labels ?? colorScale.calculateLabels();
                arcColorDict = labels.reduce((acc: Record<string, string>, curr: string, index: number) => {
                    acc[curr] = colorScale.colors[index];
                    return acc;
                }, {});
                geoJSON = this._addColorToGeoJSONFeaturesByDate(geoJSON, colorScale, arcColorDict, layer.legend.unit, layer.label);
            }

            map.addClusterPointGeoJSONLayer(layer.id, geoJSON, arcColorDict, { ...layer });
        } catch (error: unknown) {
            if (error instanceof Error) throw error;
            else throw new Error(`Errore nell'esecuzione del comando.`);
        }
    }

    /** Methods */
    private _addColorToGeoJSONFeaturesByDate(geoJSON: GeoJSON.FeatureCollection, colorScale: ColorScale, arcColorDict: Record<string, string>, unit: string | undefined, layerLabel: string | undefined): GeoJSON.FeatureCollection {
        const now: number = new Date().getTime();

        return {
            ...geoJSON,
            features: geoJSON.features.map((f: GeoJSON.Feature) => {
                const properties: any = f.properties ?? {};
                const date = new Date(properties['creationDate']);
                const timestamp: number = date.getTime();
                const elapsedMs: number = now - timestamp;
                const elapsedHours: number = (elapsedMs / (1000 * 60 * 60));
                const color: string = colorScale.getColor(elapsedHours);

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

    private _mergeFeatureCollections(collections: GeoJSON.FeatureCollection[]): GeoJSON.FeatureCollection {
        return {
            type: 'FeatureCollection',
            features: collections.flatMap((c) => c.features || [])
        }
    }

    private _createUrlWithDate(url: string, date?: Date): string {
        const d = date || new Date();
        const formatted = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
        // return `${url}?time=${encodeURIComponent(formatted)}`;
        return `${url}?time=2024-10-18%2000%3A02`
    }
}