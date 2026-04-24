// Libraries
import { Injectable } from '@angular/core';

// Models
import { AppConfig, ColorScaleBase, LayerCategory, LayerGroup, MapConfig, RadarConfigGroup, SensorType, Settings, StationBase, StationPopupConfig, TableConfigGroup } from '../models';

// Service
@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private APP_CONFIG_URI = '/configs/app.config.json';
  private _appConfig!: AppConfig;

  constructor() { }

  // Getter and setter
  public get appConfig(): AppConfig { return this._appConfig }
  private set appConfig(value: AppConfig) {
    this._appConfig = value;
  }

  // Methods
  // Get and parse app local config file
  public async getAppConfig(): Promise<void> {
    return fetch(this.APP_CONFIG_URI)
      .then((res: Response) => {
        if (!res.ok) throw new Error('Errore nel recupero della configurazione dell\'app dal file /configs/app.config.json');
        return res.json();
      })
      .then((config: any) => {
        this.appConfig = AppConfig.createFromObject(config)
      })
      .catch((err: any) => {
        throw new Error(`Errore nel recupero della configurazione dell\'app dal file /configs/app.config.json ${err.message || err}`);
      })
  }

  // Get and parse 'Data' page local json config files
  public async getMapConfig(): Promise<MapConfig> {
    return fetch(this.appConfig.mapConfigUri)
      .then((res: Response) => {
        if (!res.ok) throw new Error('Errore nel recupero della configurazione della mappa dal file /configs/map.config.json');
        return res.json();
      })
      .then((config: any) => {
        return MapConfig.createFromObject(config);
      })
      .catch((err: any) => {
        throw new Error(`Errore nel recupero della configurazione della mappa dal file /configs/map.config.json ${err.message || err}`);
      })
  }

  public async getSettings(): Promise<Settings> {
    return fetch(this.appConfig.settingsConfigUri)
      .then((res: Response) => {
        if (!res.ok) throw new Error('Errore nel recupero dei settings dal file /configs/settings.config.json');
        return res.json();
      })
      .then((config: any) => {
        return Settings.createFromObject(config);
      })
      .catch((err: any) => {
        throw new Error(`Errore nel recupero dei settings dal file /configs/settings.config.json ${err.message || err}`);
      })
  }

  public async getColorScales(): Promise<ColorScaleBase[]> {
    return fetch((this.appConfig.colorScalesUri))
      .then((res: Response) => {
        if (!res.ok) throw new Error('Errore nel recupero delle color scales dal file /configs/color-scales.config.json');
        return res.json();
      })
      .then((data: any) => {
        return data['scales'].map((d: any) => {
          return {
            id: d['id'] ?? '',
            colors: d['colors'] ?? [],
            type: d['type'] ?? 'linear'
          }
        })
      })
      .catch((err: any) => {
        throw new Error(`Errore nel recupero delle color scales dal file /configs/color-scales.config.json ${err.message || err}`);
      })
  }

  public async getBaseLayers(): Promise<LayerGroup[]> {
    return fetch(this.appConfig.baseLayersUri)
      .then((res: Response) => {
        if (!res.ok) throw new Error('Errore nel recupero dei base layers dal file di configurazione /configs/base-layers.config.json');
        return res.json();
      })
      .then((data: any) => {
        return data['layers'].map((d: any) => LayerGroup.createFromObject(d))
      })
      .catch((err: any) => {
        throw new Error(`Errore nel recupero dei base layers dal file di configurazione /configs/base-layers.config.json ${err.message || err}`);
      })
  }

  public async getInfoLayers(): Promise<LayerGroup[]> {
    return fetch(this.appConfig.infoLayersUri)
      .then((res: Response) => {
        if (!res.ok) throw new Error('rrore nel recupero dei layer informativi dal file di configurazione /configs/info-layers.config.json');
        return res.json();
      })
      .then((data: any) => {
        return data['layers'].map((d: any) => LayerGroup.createFromObject(d))
      })
      .catch((err: any) => {
        throw new Error(`Errore nel recupero dei layer informativi dal file di configurazione /configs/info-layers.config.json ${err.message || err}`);
      })
  }

  public async getDataLayers(): Promise<LayerGroup[]> {
    return fetch(this.appConfig.dataLayersUri)
      .then((res: Response) => {
        if (!res.ok) throw new Error('Errore nel recupero della configurazione dei layer /configs/map-layers.config.json');
        return res.json();
      })
      .then((data: any) => {
        return data['layers'].map((d: any) => {
          try {
            return LayerGroup.createFromObject(d);
          } catch (error) {
            console.warn('Oggetto non valido, verrà ignorato:', d, error);
            return null;
          }
        }).filter((checkbox: LayerGroup | null) => checkbox !== null)
      })
      .catch((err: any) => {
        throw new Error(`Errore nel recupero della configurazione dei layer /configs/map-layers.config.json ${err.message || err}`);
      })
  }

  public async getLayersCategories(): Promise<LayerCategory[]> {
    return fetch(this.appConfig.layerCategoriesUri)
      .then((res: Response) => {
        if (!res.ok) throw new Error('Errore nel recupero delle categorie dei layer dal file di configurazione /configs/layer-categories.config.json');
        return res.json();
      })
      .then((data: any) => {
        return data['layers'].map((d: any) => LayerCategory.createFromObject(d))
      })
      .catch((err: any) => {
        throw new Error(`Errore nel recupero delle categorie dei layer dal file di configurazione /configs/layer-categories.config.json ${err.message || err}`);
      })
  }

  public async getApis(): Promise<Map<string, string>> {
    return fetch(this.appConfig.apiConfigUri)
      .then((res: Response) => {
        if (!res.ok) throw new Error('Errore nel recupero degli endpoint delle api dal file di configurazione /configs/api.config.json');
        return res.json();
      })
      .then((data: any) => {
        const rawApis = data['apis'];

        if (typeof rawApis !== 'object' || rawApis === null) {
          throw new Error('Il campo \'apis\' non è un oggetto valido');
        }

        const entries = Object.entries(rawApis)
          .filter(([_key, value]) => typeof value === 'string')
          .map(([key, value]) => [key, value as string] as [string, string]);

        return new Map<string, string>(entries);
      })
      .catch((err: any) => {
        throw new Error(`'Errore nel recupero degli endpoint delle api dal file di configurazione /configs/api.config.json ${err.message || err}`);
      })
  }

  public async getTableConfigGroups(): Promise<TableConfigGroup[]> {
    return fetch(this.appConfig.tablesConfigUri)
      .then((res: Response) => {
        if (!res.ok) throw new Error('Errore nel recupero della configurazione delle tabelle dal file di configurazione /configs/tables.config.json');
        return res.json();
      })
      .then((data: any) => {
        return data['tableGroups'].map((d: any) => TableConfigGroup.createFromObject(d));
      })
      .catch((err: any) => {
        throw new Error(`Errore nel recupero della configurazione delle tabelle dal file di configurazione /configs/tables.config.json ${err.message || err}`);
      })
  }

  public async getTableLabels(): Promise<Map<string, string>> {
    return fetch(this.appConfig.tablesConfigUri)
      .then((res: Response) => {
        if (!res.ok) throw new Error('Errore nel recupero delle etichette delle tabelle dal file di configurazione /configs/tables.config.json');
        return res.json();
      })
      .then((data: any) => {
        return new Map(Object.entries(data['labels'])) as Map<string, string>;
      })
      .catch((err: any) => {
        throw new Error(`Errore nel recupero delle etichette delle tabelle dal file di configurazione /configs/tables.config.json ${err.message || err}`);
      })
  }

  public async getRadarConfigGroups(): Promise<RadarConfigGroup[]> {
    return fetch(this.appConfig.radarConfigUri)
      .then((res: Response) => {
        if (!res.ok) throw new Error('Errore nel recupero della configurazione dei radar dal file di configurazione /configs/radar.config.json');
        return res.json();
      })
      .then((data: any) => {
        return data['layers'].map((d: any) => RadarConfigGroup.createFromObject(d));
      })
      .catch((err: any) => {
        throw new Error(`Errore nel recupero della configurazione dei radar dal file di configurazione /configs/radar.config.json ${err.message || err}`);
      })
  }

  public async getStations(): Promise<StationBase[]> {
    return fetch(this.appConfig.stationsConfigUri)
      .then((res: Response) => {
        if (!res.ok) throw new Error('Errore nel recupero dei dati delle stazioni dal file di configurazione /configs/stations.config.json');
        return res.json();
      })
      .then((data: any) => {
        return data['stations'].map((d: any) => StationBase.createFromObject(d));
      })
      .catch((err: any) => {
        throw new Error(`Errore nel recupero dei dati delle stazioni dal file di configurazione /configs/stations.config.json ${err.message || err}`);
      })
  }

  public async getStationsPopupConfig(): Promise<Map<string, string>> {
    return fetch(this.appConfig.stationsPopupConfigUri)
      .then((res: Response) => {
        if (!res.ok) throw new Error('Errore nel recupero della configurazione del popup delle stazioni dal file di configurazione /configs/stations-popup.config.json');
        return res.json();
      })
      .then((data: any) => {
        if (!('config' in data) || !('visibleParams' in data['config'])) throw new Error(`Formato configurazione non valido.`);
        return new Map(Object.entries(data['config']['visibleParams'] as Record<string, string>));
      })
      .catch((err: any) => {
        throw new Error(`Errore nel recupero della configurazione del popup delle stazioni dal file di configurazione /configs/stations-popup.config.json ${err.message || err}`);
      })
  }

  public async getSensorTypesConfig(): Promise<SensorType[]> {
    return fetch(this.appConfig.sensorTypesUri)
      .then((res: Response) => {
        if (!res.ok) throw new Error('Errore nel recupero dei tipi dei sensori da /configs/sensor-types.config.json');
        return res.json();
      })
      .then((data: any) => {
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
      .catch((err: any) => {
        throw new Error(`Errore nel recupero dei tipi dei sensori da /configs/sensor-types.config.json ${err.message || err}`);
      })
  }
}