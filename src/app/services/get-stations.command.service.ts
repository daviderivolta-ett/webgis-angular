// Libraries
import { Injectable } from '@angular/core';

// Models
import { Command } from '../models';

// Service
@Injectable({
  providedIn: 'root'
})
export class GetAndRenderStationsCommandService implements Command {
  public async execute(params: any): Promise<void> {
    try {
      const { id, url, map, ...rest } = params;

      if (!id) {
        throw new Error('Parametro \'id\' mancante. Assicurati di fornire un identificatore univoco per il layer.');
      }
      if (!url) {
        throw new Error('Parametro \'url\' mancante. Non posso eseguire la ricerca delle stazioni senza un URL valido.');
      }
      if (!map) {
        throw new Error('Oggetto \'map\' non è un\'istanza di MapComponent. Assicurati di passare un oggetto valido.');
      }

      const res = await fetch('stations.mock.geojson');
      const geoJSON = await res.json();
      map.addCustomMarkerPointGeoJSONLayer(id, geoJSON, { ...rest });
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

  private _countProgressiveClusterLayers(layers: Map<number, any>): number {
    let count: number = 0;
    for (const element of layers.entries()) {
      if (element[1]?.options?.layerType === 'progressive_cluster') count++;
    }
    return count;
  }
}
