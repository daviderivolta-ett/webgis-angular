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

  public async getApiData(url: string, token?: string): Promise<any> {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    return fetch(url, { headers })
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

  public async getPolygonApiData(url: string, token?: string): Promise<any> {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    return fetch(url, { headers })
      .then((res: Response) => {
        if (!res.ok) throw new Error(`Errore nel recupero dei dati da ${url}`)
        return res.json();
      })
      .catch((err: unknown) => {
        if (err instanceof Error) throw err;
        else throw new Error(`Errore nel recupero dei dati da ${url}: ${err}`);
      })
  }

  public buildUrl(baseUrl: string, endpoint: string): string {
    return baseUrl + endpoint;
  }

  public replaceApiUrlPlaceholder(url: string, param: string): string {
    return url.replace(/{(\w+)}/g, param);
  }

  public replaceApiBaseUrl(url: string, param: string): string {
    return url.replace(/\{\{BASE_URL\}\}/, param);
  }

  public addSearchParamsToUrl(baseurl: string, params: Record<string, string>): string {
    const url = new URL(baseurl);
    Object.entries(params).forEach((value: [string, string]) => url.searchParams.set(value[0], value[1]));
    return url.toString();
  }

  public getByPath(obj: any, path: string) {
    return path
      .replace(/\[(\d+)\]/g, '.$1')
      .split('.')
      .filter(Boolean)
      .reduce((acc, key) => acc?.[key], obj)
  }

  public formatDate(date: Date) {
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  }
}