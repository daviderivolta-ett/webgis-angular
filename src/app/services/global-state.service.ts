/** Dependencies */
import { Injectable } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'

/** Services */
import { ApiService } from './api.service';

/** Service */
@Injectable({
  providedIn: 'root'
})
export class GlobalStateService {
  /** Constructor */
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService
  ) { }

  /** Methods */
  public hasInterestingQueryParams() {
    const params = new URLSearchParams(window.location.search);
    const layerIds: string[] = params.getAll('layer');
    const baseLayerIds: string[] = params.getAll('base');
    const infoLayerIds: string[] = params.getAll('info');
    const lat: string[] = params.getAll('lat');
    const lon: string[] = params.getAll('lon');
    const zoom: string[] = params.getAll('zoom');
    return ([...layerIds, ...baseLayerIds, ...infoLayerIds, ...lat, ...lon, ...zoom].length > 0) ? true : false;
  }

  public replaceQueryParams(params: Record<string, any>): void {
    this.router.navigate([], {
      queryParams: { ...params },
      queryParamsHandling: 'replace'
    });
  }

  public async getLatestUserPreferences(url: string, token?: string) {
    return this.apiService.getApiData(url, token)
      .then((data: any) => {
        if (!('jsonValue' in data) || typeof data['jsonValue'] !== 'string') throw new Error(`Formato della risposta della configurazione del popup non valido.`);
        try {
          return JSON.parse(data['jsonValue']);
        } catch (error) {
          throw new Error(`Errore nel parsing delle preference dell'utente.`);
        }
      })
      .catch((err: unknown) => {
        if (err instanceof Error) throw err;
        else throw new Error(`Errore nel recupero dei dati da ${url}: ${err}`);
      })
  }

  public async saveQueryParams(url: string, configName: string, configTag: string, configType: string, obj: Record<any, any>, token?: string): Promise<void> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    return fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: configName,
        tag: configTag,
        configurationType: configType,
        jsonValue: JSON.stringify(obj)
      })
    })
      .then((res: Response) => {
        if (!res.ok) throw new Error(`Errore durante il salvataggio delle preferenze del'utente.`);
      })
      .catch((err: unknown) => {
        throw new Error(err instanceof Error ? err.message : `Errore durante il salvataggio delle preferenze del'utente.`);
      })
  }

  public getQueryParam(paramKeys: string[]): Record<string, string[]> {
    const paramMap = this.route.snapshot.queryParamMap;
    return paramKeys.reduce((acc: Record<string, string[]>, key) => {
      const value: string[] = paramMap.getAll(key);
      if (value !== null) acc[key] = [...value];
      return acc;
    }, {});
  }

  public updateLayerQueryParams(activeLayersIds: string[]): void {
    this.router.navigate([], {
      queryParams: { layer: [...activeLayersIds] },
      queryParamsHandling: 'merge'
    });
  }

  public updateFirstQueryParamValue(param: string, value: string): void {
    const values: string[] = this.route.snapshot.queryParamMap.getAll(param);
    const updated: string[] = [value, ...values.slice(1)];

    this.router.navigate([], {
      queryParams: { [param]: updated },
      queryParamsHandling: 'merge'
    });
  }

  public updateQueryParams(params: Record<string, any>): void {
    this.router.navigate([], {
      queryParams: params,
      queryParamsHandling: 'merge'
    })
  }

  public changeLayerQueryParams(param: string, idsToAdd: string[], idsToRemove: string[]): void {
    const layers: string[] = this.route.snapshot.queryParamMap.getAll(param);
    const result: string[] = Array.from(new Set([...layers.filter((id: string) => !idsToRemove.includes(id)), ...idsToAdd]));
    this.router.navigate([], {
      queryParams: { [param]: result.length ? result : null },
      queryParamsHandling: 'merge'
    })
  }

  public setDateToQueryParams(date?: Date): void {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
      this.updateFirstQueryParamValue('date', '');
      return;
    }
    const local: string = this._toDatetimelocal(date);
    this.updateFirstQueryParamValue('date', local);
  }

  public getDateFromQueryParams(): Date | undefined {
    const dateStr: string | null = this.route.snapshot.queryParamMap.get('date');
    if (!dateStr) return undefined;
    const date: Date = new Date(dateStr);
    return isNaN(date.getTime()) ? undefined : date;
  }

  private _toDatetimelocal(date: Date): string {
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  }
}