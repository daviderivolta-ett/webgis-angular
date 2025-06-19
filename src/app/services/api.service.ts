/** Libraries */
import { Injectable } from '@angular/core';

/** Service */
@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor() { }

  public async getTableData(url: string) {
    return fetch(url)
      .then((res: Response) => {
        if (!res.ok) throw new Error(`Errore nel recupero dei dati da ${url}`);
        return res.json();
      })
      .then((data: any) => {
        return data;
      })
      .catch((err: any) => {
        throw new Error(`Errore nel recupero dei dati da ${url}: ${err.message || err}`);
      })
  }
}