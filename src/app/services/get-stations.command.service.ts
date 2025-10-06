// Libraries
import { Injectable } from '@angular/core';

// Models
import { Command, ColorScale, MarkerMapping, MarkerCondition, GeoJsonLayer } from '../models';

// Service
@Injectable({
  providedIn: 'root'
})
export class GetAndRenderStationsCommandService implements Command {
  public async execute(args: any): Promise<void> {
    try {
      const { map, date, colorScale, layer } = args;

      if (!layer || !(layer instanceof GeoJsonLayer)) {
        throw new Error(`Parametro 'layer' mancante od errato. Assicurati di passare al comando un layer di classe 'GeoJsonLayer'.`)
      }

      if (!map || typeof map.addCustomMarkerPointGeoJSONLayer !== 'function') {
        throw new Error(`Oggetto 'map' non valido o non implementa il metodo 'addCustomMarkerPointGeoJSONLayer'.`);
      }

      /**
       * 
       * 
       * GIAN, DEVI LAVORARE PIÙ O MENO QUI
       * 
       * 
       */

      // Immagino qui andrà la logica di creazione dell'url con query delle date
      // Visto che mostreremo sia dati demo che reali da database direi servirà 
      // un qualche tipo di switch, visto che se facciamo una chiamata con query
      // su un file mock nella cartella public riceveremo un errore
      // (mentre da api senza data riceveremmo comodamente l'ultimo disponibile)
      if (date && date instanceof Date) console.log(layer.createUrlWithDate(date));

      const res = await fetch(layer.url);

      // Qui ho fatto un parsing brutto per estrarre il geojson dalla response mock
      // di Lorenzo. Spero che un giorno non servirà e l'api ci restitiurà direttamente
      // il GeoJSON che bramiamo. Oppure no; in quel caso magari sistemiamo i metodi 
      // di parsing nella classe Utils od in una classe Utils specifica
      let rawJson = await res.json();          
      let geoJSON: GeoJSON.FeatureCollection | undefined;
      if (this._isGeoJSON(rawJson)) geoJSON = rawJson as GeoJSON.FeatureCollection;
      else geoJSON = this._searchForGeoJSON(rawJson) as GeoJSON.FeatureCollection;
      if (!geoJSON) return;
      
      // let geoJSON: GeoJSON.FeatureCollection = await res.json();
      /**
       * 
       * 
       * FINO A QUI
       * 
       * 
      */
     if (colorScale instanceof ColorScale && layer.legend) geoJSON = this._addColorToGeoJSONFeatures(geoJSON, colorScale, layer.legend.unit, layer.label);
     if (layer.markers) geoJSON = this._addMarkerShapeIdToGeoJSONFeatures(geoJSON, layer.markers);
      map.addCustomMarkerPointGeoJSONLayer(layer.id, geoJSON, { ...layer });
    } catch (error) {
      console.error(`Errore nell'esecuzione del comando:`, error);
      throw error;
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
