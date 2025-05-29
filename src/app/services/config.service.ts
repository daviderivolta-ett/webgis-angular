// Libraries
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, lastValueFrom, map, Observable, throwError } from 'rxjs';

// Models
import { AppConfig, MapConfig, StationLayer, TileLayer, WMSLayer } from '../models';
import { Checkbox } from '../models/ui/checkbox/checkbox.class';

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
          this.appConfig = AppConfig.createFromObject(config);
        }),
        catchError((err: any) => {
          return throwError(() => new Error('Errore nel recupero della configurazione dell\'app dal file /configs/app.config.json'));
        })
      )
  }

  // Get and parse 'Data' page local json config files
  public getMapConfig(): Observable<MapConfig> {
    return this.http.get<any>(this.DATAPAGE_MAPCONFIG_URI)
      .pipe(
        map((config: any) => {
          return MapConfig.createFromObject(config);
        }),
        catchError((err: any) => {
          return throwError(() => new Error('Errore nel recupero della configurazione della mappa dal file /configs/map.config.json'));
        })
      )
  }

  public getBaseLayers(): Observable<TileLayer[]> {
    return this.http.get<any[]>(this.DATAPAGE_BASELAYERS_URI)
      .pipe(
        map((data: any[]) => data.map((d: any) => TileLayer.createFromObject(d))),
        catchError((err: any) => {
          return throwError(() => new Error('Errore nel recupero dei base layers dal file di configurazione /configs/base-layers.config.json'));
        })
      )
  }

  public getInfoLayers(): Observable<WMSLayer[]> {
    return this.http.get<any[]>(this.DATAPAGE_INFOLAYERS_URI)
      .pipe(
        map((data: any[]) => data.map((d: any) => WMSLayer.createFromObject(d))),
        catchError((err: any) => {
          return throwError(() => new Error('Errore nel recupero dei layer informativi dal file di configurazione /configs/info-layers.config.json'));
        })
      )
  }

  public getMapLayers() {
    return this.http.get<any[]>(this.DATAPAGE_MAPLAYERS_URI)
      .pipe(
        map((data: any[]) => {
          return data.map((d) => {
            try {
              return Checkbox.createFromObject(d);
            } catch (error) {
              console.warn('Oggetto non valido, verrà ignorato:', d);
              return null;
            }
          }).filter((checkbox) => checkbox !== null)
        }),
        catchError((err: any) => {
          return throwError(() => new Error(err.message));
        })
      )
  }
}