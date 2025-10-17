// Libraries
import { Injectable } from '@angular/core';

// Models
import { Command, ColorScale, MarkerMapping, MarkerCondition, GeoJsonLayer } from '../models';

/** Services */
import { ApiService } from './api.service';

// Service
@Injectable({
  providedIn: 'root'
})
export class GetAndRenderStationsCommandService implements Command {
  constructor(private apiService: ApiService) { }

  public async execute(args: any): Promise<void> {
    const { map, date, colorScale, layer, token } = args;
    try {
      if (!layer || !(layer instanceof GeoJsonLayer)) throw new Error(`Parametro 'layer' mancante od errato. Assicurati di passare al comando un layer di classe 'GeoJsonLayer'.`);
      if (!map || typeof map.addCustomMarkerPointGeoJSONLayer !== 'function') throw new Error(`Oggetto 'map' non valido o non implementa il metodo 'addCustomMarkerPointGeoJSONLayer'.`);
      if (date && date instanceof Date) console.log(layer.createUrlWithDate(date));

      let geoJSON: GeoJSON.FeatureCollection = await this.apiService.getApiData(layer.url, token);
     
      if (colorScale instanceof ColorScale && layer.legend) geoJSON = this._addColorToGeoJSONFeatures(geoJSON, colorScale, layer.legend.unit, layer.label);
      if (layer.markers) geoJSON = this._addMarkerShapeIdToGeoJSONFeatures(geoJSON, layer.markers);

      map.addCustomMarkerPointGeoJSONLayer(layer.id, geoJSON, { ...layer });
    } catch (error: unknown) {
      if (error instanceof Error) throw error;
      else throw new Error(`Errore nell'esecuzione del comando.`);
    }
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
}