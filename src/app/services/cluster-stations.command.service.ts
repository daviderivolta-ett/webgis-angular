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
export class ClusterStationsService implements Command {
  constructor(private apiService: ApiService) { }

  public async execute(args: any): Promise<void> {
    const { map, date, colorScale, layer, token } = args;
    try {
      if (!layer || !(layer instanceof GeoJsonLayer)) throw new Error(`Parametro 'layer' mancante od errato. Assicurati di passare al comando un layer di classe 'GeoJsonLayer'.`);
      if (!map || typeof map.addClusterPointGeoJSONLayer !== 'function') throw new Error(`Oggetto 'map' non valido o non implementa il metodo 'addCustomMarkerPointGeoJSONLayer'.`);
      if (date && date instanceof Date) console.log(layer.createUrlWithDate(date));

      let geoJSON: GeoJSON.FeatureCollection = await this.apiService.getApiData(layer.url, token);
      geoJSON = this._addTypeToGeoJSONFeatures(geoJSON);

      let arcColorDict: Record<string, string> = {};

      if (colorScale instanceof ColorScale && layer.legend) {
        const labels = colorScale.labels ?? colorScale.calculateLabels();
        arcColorDict = labels.reduce((acc: Record<string, string>, curr: string, index: number) => {
          acc[curr] = colorScale.colors[index];
          return acc;
        }, {});

        switch (layer.layerCategory) {
          case 'data_geojson-point':
            geoJSON = this._addColorToGeoJSONFeatures(geoJSON, colorScale, arcColorDict, layer.legend.unit);
            break;

          case 'data_geojson-point--cluster':
            geoJSON = this._addColorToGeoJSONFeaturesByDate(geoJSON, colorScale, arcColorDict, layer.legend.unit, layer.label);
            break;

          default:
            console.warn(`Campo 'layerCategory' non riconosciuto ${layer.layerCategory}`);
            break;
        }
      }

      map.addClusterPointGeoJSONLayer(layer.id, geoJSON, arcColorDict, { ...layer });
    } catch (error: unknown) {
      if (error instanceof Error) throw error;
      else throw new Error(`Errore nell'esecuzione del comando.`);
    }
  }

  private _addTypeToGeoJSONFeatures(geoJSON: GeoJSON.FeatureCollection): GeoJSON.FeatureCollection {
    const featureCollection = this._mergeFeatureCollections(geoJSON as unknown as GeoJSON.FeatureCollection[]);

    return {
      ...featureCollection,
      features: featureCollection.features.map((feature: GeoJSON.Feature) => {
        const properties = feature.properties ?? {};
        return {
          ...feature,
          properties: {
            ...properties,
            type: 'lightning'
          }
        }
      })
    }
  }

  private _addColorToGeoJSONFeatures(geoJSON: GeoJSON.FeatureCollection, colorScale: ColorScale, arcColorDict: Record<string, string>, unit: string | undefined): GeoJSON.FeatureCollection {
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
            clusterLabel: Object.keys(arcColorDict).find((key: string) => arcColorDict[key] === color)
          }
        };
      })
    }
  }

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
}