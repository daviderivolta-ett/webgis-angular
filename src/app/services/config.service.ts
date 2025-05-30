// Libraries
import { Injectable } from '@angular/core';

// Models
import { AppConfig, GroupedCheckboxItem, MapConfig, TileLayer, WMSLayer } from '../models';

// Service
@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private APP_CONFIG_URI = '/configs/app.config.json';
  private DATAPAGE_BASELAYERS_URI = '/configs/base-layers.config.json';
  private DATAPAGE_INFOLAYERS_URI = '/configs/info-layers.config.json';
  private DATAPAGE_MAPCONFIG_URI = '/configs/map.config.json';
  private DATAPAGE_MAPLAYERS_URI = '/configs/map-layers.json';

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
    return fetch(this.DATAPAGE_MAPCONFIG_URI)
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

  public async getBaseLayers(): Promise<TileLayer[]> {
    return fetch(this.DATAPAGE_BASELAYERS_URI)
      .then((res: Response) => {
        if (!res.ok) throw new Error('Errore nel recupero dei base layers dal file di configurazione /configs/base-layers.config.json');
        return res.json();
      })
      .then((data: any[]) => {
        return data.map((d: any) => TileLayer.createFromObject(d))
      })
      .catch((err: any) => {
        throw new Error(`Errore nel recupero dei base layers dal file di configurazione /configs/base-layers.config.json ${err.message || err}`);
      })
  }

  public async getInfoLayers(): Promise<WMSLayer[]> {
    return fetch(this.DATAPAGE_INFOLAYERS_URI)
      .then((res: Response) => {
        if (!res.ok) throw new Error('rrore nel recupero dei layer informativi dal file di configurazione /configs/info-layers.config.json');
        return res.json();
      })
      .then((data: any[]) => {
        return data.map((d: any) => WMSLayer.createFromObject(d))
      })
      .catch((err: any) => {
        throw new Error(`Errore nel recupero dei layer informativi dal file di configurazione /configs/info-layers.config.json ${err.message || err}`);
      })
  }

  public getMapLayers(): Promise<GroupedCheckboxItem[]> {
    return fetch(this.DATAPAGE_MAPLAYERS_URI)
      .then((res: Response) => {
        if (!res.ok) throw new Error('Errore nel recupero della configurazione dei layer /configs/map-layers.config.json');
        return res.json();
      })
      .then((data: any[]) => {
        return data.map((d: any) => {
          try {
            return GroupedCheckboxItem.createFromObject(d)
          } catch (error) {
            console.warn('Oggetto non valido, verrà ignorato:', d);
            return null;
          }
        }).filter((checkbox) => checkbox !== null)
      })
      .catch((err: any) => {
        throw new Error(`Errore nel recupero della configurazione dei layer /configs/map-layers.config.json ${err.message || err}`);
      })
  }
}