/** Dependencies */
import { Injectable } from '@angular/core';

/** Models */
import { Sensor, StationBase } from '../models';

/** Services */
import { ApiService } from './api.service';

/** Service */
@Injectable({
  providedIn: 'root'
})
export class StationsService {

  constructor(private apiService: ApiService) { }

  public async getAllParameters(url: string, token?: string): Promise<Sensor[]> {
    return this.apiService.getApiData(url, token)
      .then((data: any) => {
        if (!Array.isArray(data)) throw new Error(`Formato dei parametri non valido.`);
        return data.map((s: any) => Sensor.createFromObject(s));
      })
      .catch((err) => {
        if (err instanceof Error) throw err;
        else throw new Error(`Errore nel recupero dei dati da ${url}: ${err}`);
      })
  }

  public async getStationParameters(url: string, token?: string): Promise<Pick<StationBase, 'id' | 'uuid' | 'name' | 'sensors'>[]> {
    return this.apiService.getApiData(url, token)
      .then((data: any) => {
        if (!Array.isArray(data)) throw new Error(`Formato dei parametri non valido.`);
        return data.map((s: any) => StationBase.createPartialFromObject(s));
      })
      .catch((err) => {
        if (err instanceof Error) throw err;
        else throw new Error(`Errore nel recupero dei dati da ${url}: ${err}`);
      })
  }

  public async getTimeSerie(url: string, stationId: string, param: string, initialDate: string, endingDate: string, token?: string): Promise<any> {
    const formattedUrl: string = this.apiService.replaceApiUrlPlaceholder(url, stationId);
    const formattedUrlWithDates: string = this.apiService.addSearchParamsToUrl(formattedUrl, { FromDate: initialDate, ToDate: endingDate });
    return this.apiService.getApiData(formattedUrlWithDates, token)
      .then((data: any) => {
        return this.parseTimeSerie(data, param);
      })
      .catch((err) => {
        console.log(err);
        return [];
      })
  }

  public parseTimeSerie(data: any, param: string): any {
    if (!Array.isArray(data)) return [];

    const filteredData = data
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

  public async getHydroImageAt(url: string, model: string, stationId: string, date: string) {
    const formattedUrl: string = this.apiService.replaceApiUrlPlaceholder(url, model);
    const formattedUrlWithStationId: string = `${formattedUrl}/${stationId}`;
    const formattedDate: string = this.apiService.formatDate(new Date(date));
    const formattedUrlWithDates: string = this.apiService.addSearchParamsToUrl(formattedUrlWithStationId, { time: formattedDate });
    console.log(formattedUrlWithDates);
  }
}