/** Libraries */
import { Injectable } from '@angular/core';

/** Services */
import { ApiService } from './api.service'

/** Service */
@Injectable({
  providedIn: 'root'
})
export class PopupService {

  constructor(private apiService: ApiService) { }

  public async getLatestPopupConfig(url: string, token?: string) {
    return this.apiService.getApiData(url, token)
      .then((data: any) => {
        if (!('jsonValue' in data) || typeof data['jsonValue'] !== 'string') throw new Error(`Formato della risposta della configurazione del popup non valido.`);
        try {
          return JSON.parse(data['jsonValue']);
        } catch (error) {
          throw new Error(`Errore nel parsing della configurazione del popup.`);
        }
      })
      .catch((err: unknown) => {
        if (err instanceof Error) throw err;
        else throw new Error(`Errore nel recupero dei dati da ${url}: ${err}`);
      })
  }

  public async postPopupConfig(url: string, configName: string, configTag: string, configType: string, obj: Record<any, any>, token?: string): Promise<void> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: configName,
        tag: configTag,
        configurationType: configType,
        jsonValue: JSON.stringify(obj)
      })
    })
      .then((res: Response) => {
        if (!res.ok) throw new Error(`Errore durante il salvataggio delle configurazioni del popup.`);
      })
      .catch((err: unknown) => {
        throw new Error(err instanceof Error ? err.message : `Errore durante il salvataggio delle configurazioni del popup.`);
      })
  }
}