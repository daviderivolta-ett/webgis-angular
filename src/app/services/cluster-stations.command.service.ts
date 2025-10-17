/** Libraries */
import { Injectable } from '@angular/core';

/** Models */
import { ColorScale, Command, GeoJsonLayer } from '../models';

/** Service */
@Injectable({
  providedIn: 'root'
})
export class ClusterStationsService implements Command {

  public async execute(args: any): Promise<void> {
    try {

      const { map, date, colorScale, layer } = args;

      if (!layer || !(layer instanceof GeoJsonLayer)) {
        throw new Error(`Parametro 'layer' mancante od errato. Assicurati di passare al comando un layer di classe 'GeoJsonLayer'.`)
      }

      if (!map || typeof map.addClusterPointGeoJSONLayer !== 'function') {
        throw new Error(`Oggetto 'map' non valido o non implementa il metodo 'addCustomMarkerPointGeoJSONLayer'.`);
      }

      if (date && date instanceof Date) console.log(layer.createUrlWithDate(date));

      const res = await fetch(layer.url);
      let rawJson = await res.json();

      let geoJSON: GeoJSON.FeatureCollection | undefined;
      if (this._isGeoJSON(rawJson)) geoJSON = rawJson as GeoJSON.FeatureCollection;
      else geoJSON = this._searchForGeoJSON(rawJson) as GeoJSON.FeatureCollection;
      if (!geoJSON) return;

      console.log(geoJSON);      

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
            geoJSON = this._addColorToGeoJSONFeaturesByDate(geoJSON, colorScale, arcColorDict);
            break;

          default:
            console.warn(`Campo 'layerCategory' non riconosciuto ${layer.layerCategory}`);
            break;
        }
      }

      map.addClusterPointGeoJSONLayer(layer.id, geoJSON, arcColorDict, { ...layer });
    } catch (error) {
      console.error('Errore nell\'esecuzione del comando:', error);
      throw error;
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

  private _addColorToGeoJSONFeaturesByDate(geoJSON: GeoJSON.FeatureCollection, colorScale: ColorScale, arcColorDict: Record<string, string>): GeoJSON.FeatureCollection {
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

  private _isGeoJSON(json: any): boolean {
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

  private _searchForGeoJSON(json: any): GeoJSON.FeatureCollection | undefined {
    if (!json || typeof json !== 'object') return;

    for (const key of Object.keys(json)) {
      const value = json[key];

      if (typeof value !== 'object') continue;


      if (this._isGeoJSON(value)) {
        return value as GeoJSON.FeatureCollection;
      } else {
        const found = this._searchForGeoJSON(json[key]);
        if (found) return found;
      }

    }
    return undefined;
  }
}