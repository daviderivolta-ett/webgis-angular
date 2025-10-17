/** Libraries */
import { Injectable } from '@angular/core';

/** Models */
import { ColorScale, Command, GeoJsonLayer } from '../models';

/** Services */
import { ApiService } from './api.service';

/** Service */
@Injectable({
  providedIn: 'root'
})
export class ClusterDateStationsService implements Command {
  constructor(private apiService: ApiService) { }

  async execute(args: any): Promise<void> {
    const { map, date, colorScale, layer, token } = args;
    try {
      if (!layer || !(layer instanceof GeoJsonLayer)) throw new Error(`Parametro 'layer' mancante od errato. Assicurati di passare al comando un layer di classe 'GeoJsonLayer'.`)
      if (!map || typeof map.addClusterPointGeoJSONLayer !== 'function') throw new Error(`Oggetto 'map' non valido o non implementa il metodo 'addCustomMarkerPointGeoJSONLayer'.`);
      if (date && date instanceof Date) console.log(layer.createUrlWithDate(date));

      let geoJSON: GeoJSON.FeatureCollection = await this.apiService.getApiData(layer.url, token);

      let arcColorDict: Record<string, string> = {};

      if (colorScale instanceof ColorScale) {
        const labels = colorScale.calculateLabels();
        arcColorDict = labels.reduce((acc: Record<string, string>, curr: string, index: number) => {
          acc[curr] = colorScale.colors[index];
          return acc;
        }, {});

        geoJSON = this._addColorToGeoJSONFeatures(geoJSON, colorScale, arcColorDict);
      }
      map.addClusterPointGeoJSONLayer(layer.id, geoJSON, arcColorDict, { ...layer });
    } catch (error: unknown) {
      if (error instanceof Error) throw error;
      else throw new Error(`Errore nell'esecuzione del comando.`);
    }
  }

  private _addColorToGeoJSONFeatures(geoJSON: GeoJSON.FeatureCollection, colorScale: ColorScale, arcColorDict: Record<string, string>): GeoJSON.FeatureCollection {
    const now: number = new Date('June 16, 2025 20:24:00').getTime();

    return {
      ...geoJSON,
      features: geoJSON.features.map((f: GeoJSON.Feature) => {
        const properties: any = f.properties ?? {};
        const date = new Date(properties['refDate']);
        const timestamp: number = date.getTime();
        const elapsedMs: number = now - timestamp;
        const elapsedHours: number = (elapsedMs / (1000 * 60 * 60));
        const color: string = colorScale.getColor(elapsedHours);

        return {
          ...f,
          properties: {
            ...properties,
            color,
            clusterLabel: Object.keys(arcColorDict).find((key: string) => arcColorDict[key] === color)
          }
        }
      })

    };
  }
}