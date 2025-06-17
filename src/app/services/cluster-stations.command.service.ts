/** Libraries */
import { Injectable } from '@angular/core';

/** Models */
import { ColorScale, Command } from '../models';

/** Service */
@Injectable({
  providedIn: 'root'
})
export class ClusterStationsService implements Command {

  public async execute(args: any): Promise<void> {
    try {
      const { id, url, map, colorScale, ...rest } = args;

      if (!id) {
        throw new Error('Parametro \'id\' mancante. Assicurati di fornire un identificatore univoco per il layer.');
      }
      if (!url) {
        throw new Error('Parametro \'url\' mancante. Non posso eseguire la ricerca delle stazioni senza un URL valido.');
      }
      if (!map || typeof map.addClusterPointGeoJSONLayer !== 'function') {
        throw new Error('Oggetto \'map\' non valido o non implementa il metodo \'addCustomMarkerPointGeoJSONLayer\'.');
      }

      const res = await fetch(url);
      let geoJSON = await res.json();

      let arcColorDict: Record<string, string> = {};
      if (colorScale instanceof ColorScale) {
        arcColorDict = colorScale.colors.reduce((acc: Record<string, string>, curr: string) => {
          acc[curr] = curr;
          return acc;
        }, {});

        geoJSON = {
          ...geoJSON,
          features: geoJSON.features.map((feature: GeoJSON.Feature) => {
            const properties: any = feature.properties ?? {};
            const value: any = properties['value'];
            const color: string = colorScale.getColor(value);
            return {
              ...feature,
              properties: {
                ...properties,
                uom: rest.legend ? rest.legend.unit : null,
                color
              }
            };
          })
        }
      }

      console.log(geoJSON);      

      map.addClusterPointGeoJSONLayer(id, geoJSON, arcColorDict, { ...rest });


    } catch (error) {
      console.error('Errore nell\'esecuzione del comando:', error);
      throw error;
    }
  }

  private _fetchData(url: string): any {
    return fetch(url)
      .then((res: Response) => {
        if (!res.ok) throw new Error(`Errore nel recupero dei dati delle stazioni: ${res.status} ${res.statusText}`);
        return res.json();
      })
      .then((data: any) => {
        return data;
      })
      .catch((err: any) => {
        throw new Error(`Errore nel recupero dei dati delle stazioni: ${err.message || err}`);
      });
  }

  private _parseData(data: any[]): GeoJSON.FeatureCollection {

    return {
      type: 'FeatureCollection',
      features: data.map((d: any) => {
        const { lat, lon, ...rest } = d;

        return {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [d['lon'] ?? 0, d['lat'] ?? 0],
          },
          properties: { ...rest }
        }
      })
    }

  }
}
