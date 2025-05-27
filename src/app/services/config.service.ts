// Libraries
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, lastValueFrom, map, Observable, throwError } from 'rxjs';

// Models
import { AppConfig, MapConfig, TileLayer, WMSLayer } from '../models';

// Service
@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private APP_CONFIG_URI = '/configs/app.config.json';
  private DATAPAGE_BASELAYERS_URI = '/configs/base-layers.config.json';
  private DATAPAGE_INFOLAYERS_URI = '/configs/info-layers.config.json';
  private DATAPAGE_MAPCONFIG_URI = '/configs/map.config.json';
  private DATAPAGE_VARIABLES_URI = '/configs/variables.json';

  private _appConfig!: AppConfig;

  constructor(private http: HttpClient) { }

  // Getter and setter
  public get appConfig(): AppConfig { return this._appConfig }
  private set appConfig(value: AppConfig) {
    this._appConfig = value;
  }

  // Methods
  // Get and parse app local config file
  public getAppConfig(): Observable<void> {
    return this.http.get<any>(this.APP_CONFIG_URI)
      .pipe(
        map((config: any) => {
          this.appConfig = this._parseAppConfig(config);
        }),
        catchError((err: any) => {
          return throwError(() => new Error('Errore nel recupero della configurazione dell\'app dal file /configs/app.config.json'));
        })
      )
  }

  private _parseAppConfig(data: any): AppConfig {
    const config = AppConfig.createDefaultAppConfig();

    if ('urls' in data && typeof data === 'object') {
      const urls: any = { ...data['urls'] };
      if ('base' in urls && typeof urls['base'] === 'string') config.urls.base = urls['base'];
      if ('infoLayers' in urls && typeof urls['infoLayers'] === 'string') config.urls.infoLayers = urls['infoLayers'];
      if ('stations' in urls && typeof urls['stations'] === 'string') config.urls.stations = urls['stations'];
    }

    return config;
  }

  // Get and parse 'Data' page local json config files
  public getMapConfig(): Observable<MapConfig> {
    return this.http.get<any>(this.DATAPAGE_MAPCONFIG_URI)
      .pipe(
        map((config: any) => {
          return this.parseMapConfig(config);
        }),
        catchError((err: any) => {
          return throwError(() => new Error('Errore nel recupero della configurazione della mappa dal file /configs/map.config.json'));
        })
      )
  }

  public parseMapConfig(data: any): MapConfig {
    return {
      position: (data['position'] && Array.isArray(data['position']) && data['position'].length === 2) ? [data['position'][0], data['position'][1]] : [0, 0],
      zoom: (data['zoom'] && typeof data['zoom'] === 'number') ? data['zoom'] : 0
    }
  }

  public getBaseLayers(): Observable<TileLayer[]> {
    return this.http.get<any[]>(this.DATAPAGE_BASELAYERS_URI)
      .pipe(
        map((data: any[]) => data.map((d: any) => this.parseBaseLayer(d))),
        catchError((err: any) => {       
          return throwError(() => new Error('Errore nel recupero dei base layers dal file di configurazione /configs/base-layers.config.json'));
        })
      )
  }

  public parseBaseLayer(data: any): TileLayer {
    return {
      id: (typeof data['id'] === 'string' && data['id']) || '',
      label: (typeof data['label'] === 'string' && data['label']) || (typeof data['id'] === 'string' && data['id']) || '',
      url: (typeof data['url'] === 'string' && data['url']) || '',
      attribution: (typeof data['attribution'] === 'string' && data['attribution']) || '',
    }
  }

  public getInfoLayers(): Observable<WMSLayer[]> {
    return this.http.get<any[]>(this.DATAPAGE_INFOLAYERS_URI)
      .pipe(
        map((data: any[]) => data.map((d: any) => this.parseInfoLayer(d))),
        catchError((err: any) => {
          return throwError(() => new Error('Errore nel recupero dei layer informativi dal file di configurazione /configs/info-layers.config.json'));
        })
      )
  }

  public parseInfoLayer(data: any): WMSLayer {
    return {
      id: (typeof data['id'] === 'string' && data['id']) || '',
      label: (typeof data['label'] === 'string' && data['label']) || (typeof data['id'] === 'string' && data['id']) || '',
      layers: (typeof data['layers'] === 'string' && data['layers']) || '',
      transparent: typeof data['transparent'] === 'boolean' ? data['transparent'] : false,
      format: (typeof data['format'] === 'string' && data['format']) || 'image/png',
      version: (typeof data['version'] === 'string' && data['version']) || '1.1.1',
      styles: (typeof data['styles'] === 'string' && data['styles']) || '',
      srs: (typeof data['srs'] === 'string' && data['srs']) || 'EPSG:3857',
    };
  }

  // public getLayerConfigOptions() {
  //   return this.http.get<any[]>(this.DATAPAGE_VARIABLES_URI)
  //     .pipe(
  //       map((data: any[]) => data.map((d: any) => this.parseLayerConfigOption(d))),
  //       catchError((err: any) => {
  //         return throwError(() => new Error(err.message));
  //       })
  //     )
  // }

  // public parseLayerConfigOption(data: any): LayerConfigOption {
  //   const option: LayerConfigOption = {
  //     id: data.id ?? '',
  //     label: data.label ?? ''
  //   };

  //   if ('maxSelections' in data && typeof data['maxSelections'] === 'number') option.maxSelections = data['maxSelections'];
  //   if ('iconUrl' in data && typeof data['iconUrl'] === 'string') option.iconUrl = data['iconUrl'];
  //   if ('url' in data && typeof data['url'] === 'string') option.url = data['url'];
  //   if ('options' in data && Array.isArray(data['options'])) option.options = data['options'].map((subOption: any) => this.parseLayerConfigOption(subOption));

  //   return option;
  // }
}