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
        return this._parseTimeSerie(data, param);
      })
      .catch((err: unknown) => {
        console.error(err);
        return [];
      });
  }

  private _parseTimeSerie(data: any, param: string): any {
    const timeserie: any[] = this._checkTimeSerie(data);
    
    const filteredData = timeserie
      .filter((d) => d['parameter'] === param)
      .map((d: any) => ({
        value: d['value'],
        date: d['referenceDate']
      }))

    const parsedData = filteredData.map((d: any) => {
      return [
        new Date(d['date']).getTime(),
        parseFloat(d['value'])
      ]
    })

    return [parsedData];
  }

  private _checkTimeSerie(data: any) {
    if (!('statusCode' in data) || data['statusCode'] !== 200) return [];
    if (!('content' in data)) return [];
    if (!('features' in data['content']) || !Array.isArray(data['content']['features'])) return [];
    const features: GeoJSON.Feature[] = data['content']['features'];

    if (features.length !== 1) return [];

    const feature: GeoJSON.Feature = features[0];

    if (!feature.properties || !('timeserie' in feature.properties) || !Array.isArray(feature.properties['timeserie'])) return [];

    return feature.properties['timeserie'];
  }
}