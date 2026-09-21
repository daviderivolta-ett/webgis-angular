/* Dependencies */
import { inject, Injectable } from '@angular/core'

/* Config */
import { SENSOR_TYPE_PARSERS } from '../config'

/* Types */
import { Chart, PlotlySettings } from '../types'
import { SensorType2, Station } from '../../../models'

/* Services */
import { ApiService, StationsService } from '../../../services'

/* Lib */
import { DateUtils } from '../../../utils'

/* Service */
@Injectable({
  providedIn: 'root',
})
export class TimeserieService {
  /* Dependency injection */
  private apiService = inject(ApiService);
  private stationsService = inject(StationsService);

  /* Methods */
  public async fetchTimeSeries(baseUrl: string, params: string[], urlParams: Record<string, string>, token?: string): Promise<Map<string, [number, number][]>> {
    const results = await Promise.all(
      params.map(async (p) => {
        const url = this.apiService.addSearchParamsToUrl(baseUrl, { Parameter: p, ...urlParams });
        const result = await this.fetchTimeSerie(url, p, token);
        return [p, result] as [string, [number, number][]];
      })
    );

    return new Map(results);
  }

  public async fetchTimeSerie(url: string, param: string, token?: string): Promise<[number, number][]> {
    return this.apiService.getApiData(url, token)
      .then((data: unknown) => {
        if (!Array.isArray(data)) throw new Error(`Invalid object.`)
        return this.parseTimeSerie(data, param);
      })
      .catch((err) => {
        console.log(err);
        return [];
      })
  }

  public parseTimeSerie(data: object[], param: string): [number, number][] {
    const seen = new Set<string>();

    return data
      .filter((d): d is object & { parameter: string, referenceDate: string, value: number } => {
        if (!('parameter' in d) || d.parameter !== param) return false;
        if (!('referenceDate' in d) || typeof d.referenceDate !== 'string') return false;
        if (!('value' in d)) return false;

        if (seen.has(d.referenceDate)) return false;

        seen.add(d.referenceDate);
        return true;
      })
      .map(d => [
        new Date(d.referenceDate).getTime(),
        Number(d.value)
      ]);
  }

  public async createChart(url: string, station: Station, sensorTypes: SensorType2[], endingDate: Date, initialDate?: Date, referenceDate?: Date): Promise<Chart | null> {
    // 1. Guard Clause: Identifica il sensore principale
    const foundSensor2 = sensorTypes.find((sensor) => sensor.id === station.parameter);
    if (!foundSensor2) return null;

    // 2. Preparazione dei dati del sensore e della stazione
    const sensors = this.#buildRelatedSensorsList(foundSensor2, sensorTypes);
    const stationSensorTypes = this.#extractFeaturedStationSensors(station, sensorTypes);

    // 3. Recupero asincrono delle serie temporali
    const timeseries = await this.fetchTimeSeries(
      url,
      sensors.map((s) => s.param),
      {
        CreationDate: DateUtils.toDateTimeLocal(referenceDate ?? endingDate),
        FromDate: DateUtils.toDateTimeLocal(initialDate ?? this.#getInitialDateGap(endingDate, foundSensor2)),
        ToDate: DateUtils.toDateTimeLocal(endingDate)
      }
    );

    // 4. Configurazione Plotly e Parsing
    const plotlySettings: PlotlySettings = {
      ...foundSensor2.plotly,
      traces: sensors.flatMap((s) => s.plotly.traces),
    };

    const parseFn = SENSOR_TYPE_PARSERS.get(foundSensor2.parser);
    if (!parseFn) return null;

    const data = parseFn(timeseries, plotlySettings, {
      date: endingDate,
      thresholds: station?.thresholdConfig,
    });

    // 5. Guard Clause finale sul parser
    if (!data) return null;

    // 6. Return del dato valido
    return {
      id: crypto.randomUUID(),
      stationId: station.id,
      stationName: station.name,
      sensors: stationSensorTypes,
      currentParameter: foundSensor2.param,
      plotly: data,
    };
  }

  public async updateChart(url: string, chart: Chart, parameter: string, endingDate: Date, initialDate?: Date, referenceDate?: Date): Promise<Chart | null> {
    console.log(parameter, endingDate, initialDate, referenceDate);

    // const foundSensor2 = sensorTypes.find((sensor) => sensor.id === station.parameter);
    // if (!foundSensor2) return null;

    // const sensors = this.#buildRelatedSensorsList(foundSensor2, sensorTypes);
    // const stationSensorTypes = this.#extractFeaturedStationSensors(station, sensorTypes);

    // const timeseries = await this.fetchTimeSeries(
    //   url,
    //   sensors.map((s) => s.param),
    //   {
    //     CreationDate: DateUtils.toDateTimeLocal(referenceDate ?? endingDate),
    //     FromDate: DateUtils.toDateTimeLocal(initialDate ?? this.#getInitialDateGap(endingDate, foundSensor2)),
    //     ToDate: DateUtils.toDateTimeLocal(endingDate)
    //   }
    // );

    // console.log(timeseries);

    return {
      ...chart,
    }
  }

  #buildRelatedSensorsList(mainSensor: SensorType2, allSensors: SensorType2[]): SensorType2[] {
    return [
      mainSensor,
      ...allSensors.filter((sensor) => mainSensor.relatedSensors.includes(sensor.id)),
    ];
  }

  #extractFeaturedStationSensors(station: Station, allSensors: SensorType2[]): SensorType2[] {
    const enabledTypeIds = new Set(
      station.sensors.filter((s) => s.enabled).map((s) => s.type)
    );

    return allSensors.filter(
      (t) => enabledTypeIds.has(t.id) && t.isFeatured
    );
  }

  #getInitialDateGap(endingDate: Date, sensorType: SensorType2): Date {
    const initialDate = new Date(endingDate);
    initialDate.setDate(initialDate.getDate() - sensorType.defaultTimeGap);
    return initialDate;
  }
}