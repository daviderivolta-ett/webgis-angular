// Libraries
import { Injectable } from '@angular/core';

// Models
import { Command, ColorScale, MarkerMapping, MarkerCondition } from '../models';

// Service
@Injectable({
  providedIn: 'root'
})
export class GetAndRenderStationsCommandService implements Command {
  public async execute(args: any): Promise<void> {
    try {
      const { id, url, map, colorScale, markers, ...rest } = args;

      if (!id) {
        throw new Error('Parametro \'id\' mancante. Assicurati di fornire un identificatore univoco per il layer.');
      }
      if (!url) {
        throw new Error('Parametro \'url\' mancante. Non posso eseguire la ricerca delle stazioni senza un URL valido.');
      }
      if (!map || typeof map.addCustomMarkerPointGeoJSONLayer !== 'function') {
        throw new Error('Oggetto \'map\' non valido o non implementa il metodo \'addCustomMarkerPointGeoJSONLayer\'.');
      }

      // const data = await this._fetchData(url);
      // const parsedData = this._parseData(data);
      // console.log(JSON.stringify(parsedData));

      const res = await fetch(url);
      let geoJSON: GeoJSON.FeatureCollection = await res.json();
      if (colorScale instanceof ColorScale) geoJSON = this._addColorToGeoJSONFeatures(geoJSON, colorScale, rest.legend.unit, rest.label);
      if (markers) geoJSON = this._addMarkerShapeIdToGeoJSONFeatures(geoJSON, markers);
      console.log(geoJSON);
      map.addCustomMarkerPointGeoJSONLayer(id, geoJSON, { ...rest });
    } catch (error) {
      console.error('Errore nell\'esecuzione del comando:', error);
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
            uom: unit,
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

  // private _fetchData(url: string): any {
  //   return fetch(url)
  //     .then((res: Response) => {
  //       if (!res.ok) throw new Error(`Errore nel recupero dei dati delle stazioni: ${res.status} ${res.statusText}`);
  //       return res.json();
  //     })
  //     .then((data: any) => {
  //       return data;
  //     })
  //     .catch((err: any) => {
  //       throw new Error(`Errore nel recupero dei dati delle stazioni: ${err.message || err}`);
  //     });
  // }

  // private _parseData(data: any[]): GeoJSON.FeatureCollection {

  //   return {
  //     type: 'FeatureCollection',
  //     features: data.map((d: any) => {
  //       const { lat, lon, ...rest } = d;

  //       return {
  //         type: 'Feature',
  //         geometry: {
  //           type: 'Point',
  //           coordinates: [d['lon'] ?? 0, d['lat'] ?? 0],
  //         },
  //         properties: { ...rest }
  //       }
  //     })
  //   }

  // }
}
