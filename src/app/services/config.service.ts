/* Dependencies */
import { inject, Injectable } from '@angular/core'

/* Models */
import { AppConfig, ColorScaleBase, LayerCategory, LayerGroup, MapConfig, RadarConfigGroup, SensorType, Settings, StationBase, TableConfigGroup } from '../models'

/* Services */
import { ApiService } from './api.service'

/* Service */
@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  /* Dependency injection */
  private apiService: ApiService = inject(ApiService);

  /* Config */
  private APP_CONFIG_URI = '/configs/app.config.json';

  /* State */
  private _appConfig!: AppConfig;

  /* Getter and setter */
  public get appConfig(): AppConfig { return this._appConfig }
  private set appConfig(value: AppConfig) {
    this._appConfig = value;
  }

  /* Methods */
  /* Get and parse app local config file */
  public async getAppConfig(): Promise<void> {
    return fetch(this.APP_CONFIG_URI)
      .then((res: Response) => {
        if (!res.ok) throw new Error('Errore nel recupero della configurazione dell\'app dal file /configs/app.config.json');
        return res.json();
      })
      .then((config: unknown) => {
        this.appConfig = AppConfig.createFromObject(config)
      })
      .catch((err: unknown) => {
        throw new Error(`Errore nel recupero della configurazione dell'app dal file /configs/app.config.json ${err instanceof Error ? err.message : err}`);
      })
  }

  /* Get and parse 'Data' page local json config files */
  public async getMapConfig(): Promise<MapConfig> {
    return fetch(this.appConfig.mapConfigUri)
      .then((res: Response) => {
        if (!res.ok) throw new Error('Errore nel recupero della configurazione della mappa dal file /configs/map.config.json');
        return res.json();
      })
      .then((config: unknown) => {
        return MapConfig.createFromObject(config);
      })
      .catch((err: unknown) => {
        throw new Error(`Errore nel recupero della configurazione della mappa dal file /configs/map.config.json ${err instanceof Error ? err.message : err}`);
      })
  }

  public async getSettings(url: string, token?: string): Promise<Settings> {
    return this.apiService.getApiData(url, token)
      .then((data: unknown) => {
        return this._getConfigValue(data);
      })
      .then((config: unknown) => {
        return Settings.createFromObject(config);
      })
      .catch((err: unknown) => {
        throw new Error(`Errore nel recupero dei settings dal file /configs/settings.config.json ${err instanceof Error ? err.message : err}`);
      })
  }

  public async getColorScales(): Promise<ColorScaleBase[]> {
    return fetch((this.appConfig.colorScalesUri))
      .then((res: Response) => {
        if (!res.ok) throw new Error('Errore nel recupero delle color scales dal file /configs/color-scales.config.json');
        return res.json();
      })
      .then((data: unknown) => {
        if (typeof data !== 'object' || data === null || !('scales' in data) || !Array.isArray(data.scales)) throw new Error('Invalid object.');

        return data['scales'].map((d: unknown) => {
          if (typeof d !== 'object' || d === null) throw new Error('Invalid scale.');

          const type: 'linear' | 'logarithmic' = 'type' in d && (d.type === 'linear' || d.type === 'logarithmic') ? d.type : 'linear';

          return {
            id: 'id' in d && typeof d.id === 'string' ? d.id : '',
            colors: 'colors' in d && Array.isArray(d.colors) ? d.colors : [],
            type
          };
        })
      })
      .catch((err: unknown) => {
        throw new Error(`Errore nel recupero delle color scales dal file /configs/color-scales.config.json ${err instanceof Error ? err.message : err}`);
      })
  }

  public async getBaseLayers(url: string, token?: string): Promise<LayerGroup[]> {
    return this.apiService.getApiData(url, token)
      .then((data: unknown) => {
        return this._getConfigValue(data);
      })
      .then((data: unknown) => {
        if (typeof data !== 'object' || data === null || !('layers' in data) || !Array.isArray(data.layers)) throw new Error('Invalid object.');
        return data['layers'].map((d: unknown) => LayerGroup.createFromObject(d))
      })
      .catch((err: unknown) => {
        throw new Error(`Errore nel recupero dei base layers dal file di configurazione /configs/base-layers.config.json ${err instanceof Error ? err.message : err}`);
      })
  }

  public async getInfoLayers(url: string, token?: string): Promise<LayerGroup[]> {
    return this.apiService.getApiData(url, token)
      .then((data: unknown) => {
        return this._getConfigValue(data);
      })
      .then((data: unknown) => {
        if (typeof data !== 'object' || data === null || !('layers' in data) || !Array.isArray(data.layers)) throw new Error('Invalid object.');
        return data['layers'].map((d: unknown) => LayerGroup.createFromObject(d))
      })
      .catch((err: unknown) => {
        throw new Error(`Errore nel recupero dei layer informativi dal file di configurazione /configs/info-layers.config.json ${err instanceof Error ? err.message : err}`);
      })
  }

  public async getDataLayers(url: string, token?: string): Promise<LayerGroup[]> {
    return this.apiService.getApiData(url, token)
      .then((data: unknown) => {
        return this._getConfigValue(data);
      })
      .then((data: unknown) => {
        if (typeof data !== 'object' || data === null || !('layers' in data) || !Array.isArray(data.layers)) throw new Error('Invalid object.');
        return data['layers'].map((d: unknown) => {
          try {
            return LayerGroup.createFromObject(d);
          } catch (error) {
            console.warn('Oggetto non valido, verrà ignorato:', d, error);
            return null;
          }
        }).filter((checkbox: LayerGroup | null) => checkbox !== null)
      })
      .catch((err: unknown) => {
        throw new Error(`Errore nel recupero della configurazione dei layer /configs/map-layers.config.json ${err instanceof Error ? err.message : err}`);
      })
  }

  public async getLayerCategories(url: string, token?: string): Promise<LayerCategory[]> {
    return this.apiService.getApiData(url, token)
      .then((data: unknown) => {
        return this._getConfigValue(data);
      })
      .then((data: unknown) => {
        if (typeof data !== 'object' || data === null || !('layers' in data) || !Array.isArray(data.layers)) throw new Error('Invalid object.');
        return data['layers'].map((d: unknown) => LayerCategory.createFromObject(d))
      })
      .catch((err: unknown) => {
        throw new Error(`Errore nel recupero delle categorie dei layer dal file di configurazione /configs/layer-categories.config.json ${err instanceof Error ? err.message : err}`);
      })
  }

  public getApis(): Promise<Map<string, string>> {
    return this.apiService.getApis(this.appConfig.apiConfigUri)
      .catch((err: unknown) => {
        throw new Error(`'Errore nel recupero degli endpoint delle api dal file di configurazione /configs/api.config.json ${err instanceof Error ? err.message : err}`);
      })
  }

  public async getTableConfigGroups(url: string, token?: string): Promise<TableConfigGroup[]> {
    return this.apiService.getApiData(url, token)
      .then((data: unknown) => {
        return this._getConfigValue(data);
      })
      .then((data: unknown) => {
        if (typeof data !== 'object' || data === null || !('tableGroups' in data) || !Array.isArray(data.tableGroups)) throw new Error('Invalid object.');
        return data['tableGroups'].map((d: unknown) => TableConfigGroup.createFromObject(d));
      })
      .catch((err: unknown) => {
        throw new Error(`Errore nel recupero della configurazione delle tabelle dal file di configurazione /configs/tables.config.json ${err instanceof Error ? err.message : err}`);
      })
  }

  public async getTableLabels(url: string, token: string): Promise<Map<string, string>> {
    return this.apiService.getApiData(url, token)
      .then((data: unknown) => {
        return this._getConfigValue(data);
      })
      .then((data: unknown) => {
        if (typeof data !== 'object' || data === null || !('labels' in data) || !Array.isArray(data.labels)) throw new Error('Invalid object.');
        return new Map(Object.entries(data['labels'])) as Map<string, string>;
      })
      .catch((err: unknown) => {
        throw new Error(`Errore nel recupero delle etichette delle tabelle dal file di configurazione /configs/tables.config.json ${err instanceof Error ? err.message : err}`);
      })
  }

  public async getRadarConfigGroups(url: string, token: string): Promise<RadarConfigGroup[]> {
    return this.apiService.getApiData(url, token)
      .then((data: unknown) => {
        return this._getConfigValue(data);
      })
      .then((data: unknown) => {
        if (typeof data !== 'object' || data === null || !('layers' in data) || !Array.isArray(data.layers)) throw new Error('Invalid object.');
        return data['layers'].map((d: unknown) => RadarConfigGroup.createFromObject(d));
      })
      .catch((err: unknown) => {
        throw new Error(`Errore nel recupero della configurazione dei radar dal file di configurazione /configs/radar.config.json ${err instanceof Error ? err.message : err}`);
      })
  }

  public async getStations(): Promise<StationBase[]> {
    return fetch(this.appConfig.stationsConfigUri)
      .then((res: Response) => {
        if (!res.ok) throw new Error('Errore nel recupero dei dati delle stazioni dal file di configurazione /configs/stations.config.json');
        return res.json();
      })
      .then((data: unknown) => {
        if (typeof data !== 'object' || data === null || !('stations' in data) || !Array.isArray(data.stations)) throw new Error('Invalid object.');
        return data['stations'].map((d: unknown) => StationBase.createFromObject(d));
      })
      .catch((err: unknown) => {
        throw new Error(`Errore nel recupero dei dati delle stazioni dal file di configurazione /configs/stations.config.json ${err instanceof Error ? err.message : err}`);
      })
  }

  public async getStationsPopupConfig(url: string, token: string): Promise<Map<string, string>> {
    return this.apiService.getApiData(url, token)
      .then((data: unknown) => {
        return this._getConfigValue(data);
      })
      .then((data: unknown) => {
        if (typeof data !== 'object' || data === null) throw new Error('Formato configurazione non valido.');
        if (!('config' in data) || typeof data.config !== 'object' || data.config === null) throw new Error('Formato configurazione non valido.');
        if (!('visibleParams' in data.config)) throw new Error('Formato configurazione non valido.');
        return new Map(Object.entries(data['config']['visibleParams'] as Record<string, string>));
      })
      .catch((err: unknown) => {
        throw new Error(`Errore nel recupero della configurazione del popup delle stazioni dal file di configurazione /configs/stations-popup.config.json ${err instanceof Error ? err.message : err}`);
      })
  }

  public async getSensorTypesConfig(url: string, token?: string): Promise<SensorType[]> {
    return this.apiService.getApiData(url, token)
      .then((data: unknown) => {
        return this._getConfigValue(data);
      })
      .then((data: unknown) => {
        if (typeof data !== 'object' || data === null || !('types' in data)) throw new Error('Invalid object.');
        const rawTypes = data['types'];

        if (!rawTypes || !Array.isArray(rawTypes)) throw new Error('Il campo \'types\' non è un oggetto valido');

        return rawTypes.map((t: any): SensorType => ({
          id: t['id'] ?? '',
          iconUrl: t['iconUrl'] ?? '',
          label: t['label'] ?? '',
          chartType: t['chartType'] ?? 'line',
          style: t['style'] ?? undefined,
          unit: t['unit'] ?? '',
          decimals: t['decimals'] ?? 1,
          multiplier: t['multiplier'] ?? undefined,
          range: t['range'] ?? undefined,
          defaultTimeGap: t['defaultTimeGap'] ?? undefined,
          isFeatured: t['isFeatured'] ?? false,
          relatedSensors: t['relatedSensors'] ?? [],
          compareWith: t['compareWith'] ?? undefined,
          isMainYAxis: t['isMainYAxis'] ?? false,
          baseColor: t['baseColor'] ?? undefined,
          thresholdKeys: t['thresholdKeys'] ?? undefined,
          thresholdColors: t['thresholdColors'] ?? undefined,
          hideZeroXAxis: t['hideZeroXAxis'] ?? false
        }))
      })
      .catch((err: unknown) => {
        throw new Error(`Errore nel recupero dei tipi dei sensori da /configs/sensor-types.config.json ${err instanceof Error ? err.message : err}`);
      })
  }

  private _getConfigValue(data: unknown): unknown {
    if (typeof data !== 'object' || data === null) throw new Error('Invalid object.')
    if (!('jsonValue' in data) || typeof data['jsonValue'] !== 'string') throw new Error(`Formato della risposta della configurazione del popup non valido.`);
    try {
      return JSON.parse(data['jsonValue']);
    } catch (err: unknown) {
      throw new Error(`Errore nel parsing delle preferenze dell'utente: ${err instanceof Error ? err.message : err}.`);
    }
  }
}