/** Dependencies */
import { Injectable } from '@angular/core';

/** Models */
import { MapChart, MapChartData, Sensor, SensorType, Station, StationBase, StationThresholdConfig } from '../models';

/** Services */
import { ApiService } from './api.service';

/** Utils */
import { DateUtils, Utils } from '../utils';

/** Service */
@Injectable({
  providedIn: 'root'
})
export class StationsService {

  constructor(private apiService: ApiService) { }

  public async getAllStations(url: string, token?: string) {
    return this.apiService.getApiData(url, token)
      .then((data: any) => {
        if (!('features' in data) || !Array.isArray(data['features'])) throw new Error(`Formato della risposta delle stazioni non valido.`);
        return data['features'].map((s: any) => StationBase.createFromObject(StationBase.createFromGeoJSONFeature(s)));
      })
      .catch((err: unknown) => {
        if (err instanceof Error) throw err;
        else throw new Error(`Errore nel recupero dei dati da ${url}: ${err}`);
      })
  }

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

    return fetch(url, {
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

  public async getTimeSeries(url: string, stationId: string, param: string, params: string[], initialDate: string, endingDate: string, token?: string): Promise<Map<string, [number, number][]>> {
    const promises: Promise<Map<string, [number, number][]>>[] = [];
    params.forEach((p: string) => {
      promises.push(this.getTimeSerie(url, stationId, p, params, DateUtils.toUTCDate(initialDate), DateUtils.toUTCDate(endingDate), token));
    });
    const maps = await Promise.all(promises);
    const resultMap = new Map<string, [number, number][]>();
    maps.forEach(map => {
      map.forEach((value, key) => {
        if (resultMap.has(key)) {
          resultMap.get(key)!.push(...value);
        } else {
          resultMap.set(key, value);
        }
      });
    });

    return resultMap;
  }

  public async getTimeSerie(url: string, stationId: string, param: string, params: string[], initialDate: string, endingDate: string, token?: string): Promise<Map<string, [number, number][]>> {
    const formattedUrl: string = this.apiService.replaceApiUrlPlaceholder(url, stationId);
    const formattedUrlWithParams: string = this.apiService.addSearchParamsToUrl(formattedUrl, { Parameter: param, FromDate: initialDate, ToDate: endingDate });
    return this.apiService.getApiData(formattedUrlWithParams, token)
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
        .filter(d => d[1])

      if (serie.length > 0) result.set(`${param}--cumulative`, serie);
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
    const formattedDate: string = DateUtils.toUTCDate(date.toISOString());
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

  public createChart(station: Station, sensorTypes: SensorType[], thresholds?: Record<string, number>): MapChart {
    const stationSensorTypeIds: string[] = station.sensors.filter((s: Sensor) => s.enabled).map((s: Sensor) => s.type);
    const stationSensorTypes: SensorType[] = sensorTypes.filter((t: SensorType) => stationSensorTypeIds.includes(t.id) && t.isFeatured);
    const minSensor: SensorType | undefined = this.compareSensorTypes(sensorTypes, 'rain', 'Pioggia nativa');
    if (minSensor) stationSensorTypes.unshift(minSensor);
    const sensorType: SensorType | undefined = sensorTypes.find((t: SensorType) => t.id === station.parameter);

    let sensorThresholds: Record<string, number> | undefined;
    if (sensorType && thresholds) sensorThresholds = this._getSensorThresholds(sensorType, thresholds);

    return new MapChart(
      station.id,
      [],
      station.parameter,
      stationSensorTypes,
      undefined,
      station.name ?? station.parameter,
      sensorType ? sensorType.label : station.parameter,
      'Data',
      '',
      undefined,
      sensorThresholds ? sensorThresholds : undefined
    );
  }

  public async updateChart(param: string, chartToUpdate: MapChart, sensorTypes: SensorType[], timeserieUrl: string, initialDate: string, endingDate: string, rangeConfig?: StationThresholdConfig, token?: string): Promise<MapChart> {
    const sensorType: SensorType | undefined = sensorTypes.find((t: SensorType) => t.id === param);
    const relatedSensors: SensorType[] = sensorTypes.filter((t: SensorType) => sensorType?.relatedSensors.includes(t.id));
    const sensors: SensorType[] = [sensorType, ...relatedSensors].filter(s => s !== undefined);

    return this.getTimeSeries(timeserieUrl, chartToUpdate.stationId, param, [param, ...(sensorType?.relatedSensors ?? [])], initialDate, endingDate, token)
      .then((data: Map<string, [number, number][]>) => {
        const chartData: MapChartData[] = [];

        sensorTypes.forEach(t => {
          if (sensors.some(s => `${s.id}--cumulative` === t.id)) sensors.push(t);
        });

        for (const entry of data.entries()) {
          const sensor = sensors.find((t: SensorType) => t.id === entry[0]);
          if (!sensor) continue;

          let customRange: [number, number] | undefined;
          if (sensor && rangeConfig) customRange = this._getSensorRange(sensor, rangeConfig);

          const chartSerie: MapChartData = new MapChartData(
            sensor.chartType,
            sensor.multiplier ?
              this.convertData(data.get(entry[0]) ?? [], sensor.multiplier) :
              data.get(entry[0]) ?? [],
            sensor.label,
            sensor.unit,
            sensor.style,
            sensor.label,
            `(${sensor.unit})`,
            customRange ?? sensor.range,
            sensor.id.includes('--cumulative') ? true : false,
            sensor.isMainYAxis ?? false
          );

          chartData.push(chartSerie);
        }

        return {
          ...chartToUpdate,
          data: chartData,
          currentParameter: param,
          currentParameterLabel: sensorType ? sensorType.label : param
        }
      })
      .catch((err: unknown) => {
        throw new Error(err instanceof Error ? err.message : `Errore nel recupero della timeseries.`);
      })
  }

  private _getSensorThresholds(sensorType: SensorType, thresholdConfig: StationThresholdConfig): Record<string, number> | undefined {
    return sensorType.thresholdKeys?.reduce((acc: Record<string, number>, curr: string) => {
      const value = (thresholdConfig as any)[curr];
      if (typeof value === 'number') acc[curr] = value;
      return acc;
    }, {} as Record<string, number>) ?? undefined;
  }

  private _getSensorRange(sensorType: SensorType, thresholdConfig: StationThresholdConfig): [number, number] | undefined {
    return (sensorType && sensorType.thresholdKeys && thresholdConfig.yMin && thresholdConfig.yMax) ? [thresholdConfig.yMin, thresholdConfig.yMax] : undefined;
  }

}