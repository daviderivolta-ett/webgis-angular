/** Dependencies */
import { Injectable } from '@angular/core';

/** Models */
import { Sensor, SensorType, StationBase } from '../models';

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

  public async patchStationParameters(url: string, obj: any, token?: string): Promise<void> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    fetch(url, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(obj)
    })
      .then((res: Response) => {
        if (!res.ok) throw new Error(`Errore durante l'aggiornamento dei parametri delle stazioni.`);
      })
      .catch((err: unknown) => {
        throw new Error(err instanceof Error ? err.message : `Errore durante l'aggiornamento dei parametri delle stazioni.`);
      })
  }

  public async getTimeSerie(url: string, stationId: string, param: string, params: string[], initialDate: string, endingDate: string, token?: string): Promise<Map<string, [number, number][]>> {
    const formattedUrl: string = this.apiService.replaceApiUrlPlaceholder(url, stationId);
    const formattedUrlWithDates: string = this.apiService.addSearchParamsToUrl(formattedUrl, { Parameter: param, FromDate: initialDate, ToDate: endingDate });
    return this.apiService.getApiData(formattedUrlWithDates, token)
      .then((data: any) => {
        return this.parseTimeSerie(data, params);
      })
      .catch((err) => {
        console.log(err);
        return new Map<string, [number, number][]>();
      })
  }

  public parseTimeSerie(data: any, params: string[]): Map<string, [number, number][]> {
    if (!Array.isArray(data)) return new Map();

    const result: Map<string, [number, number][]> = new Map<string, [number, number][]>();

    params.map(param => {
      const serie = data
        .filter(d => d['parameter'] === param)
        .map(d => [
          new Date(d['referenceDate']).getTime(),
          parseFloat(d['cumulativeValue'])
        ] as [number, number])

      result.set(`${param}--cumulative`, serie);
    });

    params.map((param: string) => {
      const serie = data
        .filter(d => d['parameter'] === param)
        .map(d => [
          new Date(d['referenceDate']).getTime(),
          parseFloat(d['value'])
        ] as [number, number])

      result.set(param, serie);
    })

    return result;
  }

  public convertData(input: [number, number][], multiplier: number): [number, number][] {
    return input.map(([x, y]) => [x, y * multiplier]);
  }

  public getHydroDateFromSubfolder(originalDate: Date, subfolder: string): Date {
    if (subfolder.length !== 4) return originalDate;

    const mid: number = Math.ceil(subfolder.length / 2);
    const splittedSubfolder: [string, string] = [subfolder.slice(0, mid), subfolder.slice(mid)];
    const splittedHoursAndMinutes: [number, number] = splittedSubfolder.map((v: string) => parseFloat(v)) as [number, number];

    const date = originalDate;
    date.setHours(splittedHoursAndMinutes[0]);
    date.setMinutes(splittedHoursAndMinutes[1]);
    date.setSeconds(0);

    return date;
  }

  public async getHydroImageAt(url: string, model: string, stationId: string, date: Date, token?: string) {
    const formattedUrl: string = this.apiService.replaceApiUrlPlaceholder(url, model);
    const formattedUrlWithStationId: string = `${formattedUrl}/${stationId}`;
    const formattedDate: string = this.apiService.formatDate(date);
    const formattedUrlWithDates: string = this.apiService.addSearchParamsToUrl(formattedUrlWithStationId, { time: formattedDate });

    return this.apiService.getApiData(formattedUrlWithDates, token)
      .then((data: any) => {
        return `data:${data['mimeType']};base64,${data['base64Data']}`;
      })
      .catch((err: unknown) => {
        throw new Error(err instanceof Error ? err.message : `Errore nel recupero dell'immagine dell'hydro.`);
      });
  }

  public compareSensorTypes(types: SensorType[], compare: string, newLabel: string): SensorType | undefined {
    const found: SensorType | undefined = types.find((t: SensorType) => {
      if (t.compareWith && typeof t.compareWith === 'string' && t.compareWith === compare) return t;
      else return undefined;
    });

    return found ? { ...found, label: newLabel } : undefined;
  }
}