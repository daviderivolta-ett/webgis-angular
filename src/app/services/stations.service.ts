/** Dependencies */
import { Injectable } from '@angular/core';

/** Service */
@Injectable({
  providedIn: 'root'
})
export class StationsService {

  public async getTimeSerie(url: string, param: string): Promise<any> {
    return fetch(url)
      .then((res: Response) => {
        if (!res.ok) throw new Error(`Errore nel recupero dei dati da ${url}`);
        return res.json();
      })
      .then((data: any) => {
        return this._parseTimeSerie(data);
      })
      .catch((err: unknown) => {
        console.error(err);
        return [];
      });
  }

  private _parseTimeSerie(data: any): any {
    return data;
  }
}