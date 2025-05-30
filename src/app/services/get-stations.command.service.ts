// Libraries
import { Injectable } from '@angular/core';

// Models
import { Command } from '../models';

// Service
@Injectable({
  providedIn: 'root'
})
export class GetStationsCommandService implements Command {
  public async execute(params: any): Promise<any> {
    const { url } = params;

    if (!url) console.warn('Parametro \'url\' non presente in \'params\'. Impossibile eseguire la ricerca delle stazioni.');

    return fetch(url)
      .then((res: Response) => {
        if (!res.ok) throw new Error(`Errore nel recupero dei dati delle stazioni: ${res.status} ${res.statusText}`);
        return res.json();
      })
      .then((data: any) => {
        // TO DO
        // Transform data
        console.log(data);        
        return data;
      })
      .catch((err: any) => {
        throw new Error(`Errore nel recupero dei dati delle stazioni: ${err.message || err}`);
      });
  }
}
