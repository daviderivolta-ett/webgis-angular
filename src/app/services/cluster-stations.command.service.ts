/** Libraries */
import { Injectable } from '@angular/core';

/** Models */
import { Command } from '../models';

/** Service */
@Injectable({
  providedIn: 'root'
})
export class ClusterStationsService implements Command {

  public async execute(args: any): Promise<void> {
    try {
      const { id, url, map, ...rest } = args;

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
      map.addClusterPointGeoJSONLayer(id, geoJSON, { ...rest });


    } catch (error) {
      console.error('Errore nell\'esecuzione del comando:', error);
      throw error;
    }
  }
}
