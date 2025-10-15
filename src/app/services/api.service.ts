/** Libraries */
import { Injectable } from '@angular/core';

/** Service */
@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor() { }

  public async getApiJSONData(url: string): Promise<any> {
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

  public async getApiData(url: string): Promise<any> {
    return fetch(url)
      .then((res: Response) => {
        if (!res.ok) throw new Error(`Errore nel recupero dei dati da ${url}`)
        return res.json();
      })
      .then((data: any) => {
        if (!('statusCode' in data) || data['statusCode'] !== 200) throw new Error(`Errore nel recupero dei dati da ${url}: ${data['statusCode'] ?? 'Errore sconosciuto'}`);
        if (!('content' in data)) throw new Error(`La risposta non contiene il campo 'content'.`);
        return data['content'];
      })
      .catch((err: unknown) => {
        if (err instanceof Error) throw err;
        else throw new Error(`Errore nel recupero dei dati da ${url}: ${err}`);
      })
  }

  public replaceApiUrlPlaceholder(url: string, param: string): string {
    return url.replace(/{(\w+)}/g, param);
  }
}