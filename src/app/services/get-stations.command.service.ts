// Libraries
import { Injectable } from '@angular/core';

// Models
import { Command, LeafletMapContext } from '../models';

// Service
@Injectable({
  providedIn: 'root'
})
export class GetAndRenderStationsCommandService implements Command {
  public async execute(params: any): Promise<void> {
    try {
      const { id, url, mapContext, layers } = params;

      if (!id) {
        throw new Error('Parametro \'id\' mancante. Assicurati di fornire un identificatore univoco per il layer.');
      }
      if (!url) {
        throw new Error('Parametro \'url\' mancante. Non posso eseguire la ricerca delle stazioni senza un URL valido.');
      }
      if (!mapContext || !(mapContext instanceof LeafletMapContext)) {
        throw new Error('Oggetto \'mapContext\' non è un\'istanza di LeafletMapContext. Assicurati di passare un oggetto valido.');
      }
      if (!(layers instanceof Map)) {
        throw new Error('Oggetto \'layers\' non è un\'istanza di Map. Assicurati di passare una mappa valida dei layer attivi.');
      }

      const data = await this._fetchData(url);
      const geoJSON: GeoJSON.FeatureCollection = this._parseData(data);
      const layer = mapContext.addGeoJSONLayer(geoJSON);
      layers.set(id, layer);
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
