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

  public async getAllParameters(url: string): Promise<Sensor[]> {
    return this.apiService.getApiData(url)
      .then((data: any) => {
        if (!Array.isArray(data)) throw new Error(`Formato dei parametri non valido.`);
        return data.map((s: any) => Sensor.createFromObject(s));
      })
      .catch((err) => {
        console.log(err);
        return [];
      })
  }

  public async getStationParameters(url: string): Promise<Pick<StationBase, 'id' | 'uuid' | 'name' | 'sensors'>[]> {
    return this.apiService.getApiData(url)
      .then((data: any) => {
        if (!Array.isArray(data)) throw new Error(`Formato dei parametri non valido.`);
        return data.map((s: any) => StationBase.createPartialFromObject(s));
      })
      .catch((err) => {
        console.log(err);
        return [];
      })
  }

  public async getTimeSerie(url: string, stationId: string, param: string): Promise<any> {
    const formattedUrl: string = this.apiService.replaceApiUrlPlaceholder(url, stationId);
    return this.apiService.getApiData(formattedUrl)
      .then((data: any) => {
        return this.parseTimeSerie(data, param);
      })
      .catch((err) => {
        console.log(err);
        return [];
      })
  }

  public parseTimeSerie(data: any, param: string): any {
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

  private _checkTimeSerie(geojson: GeoJSON.FeatureCollection) {
    if (!('features' in geojson) || !Array.isArray(geojson['features'])) return [];
    const features: GeoJSON.Feature[] = geojson['features'];

    if (features.length !== 1) return [];

    const feature: GeoJSON.Feature = features[0];

    if (!feature.properties || !('timeserie' in feature.properties) || !Array.isArray(feature.properties['timeserie'])) return [];

    return feature.properties['timeserie'];
  }
}