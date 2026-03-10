/** Dependencies */
import { Injectable } from '@angular/core'
import { ActivatedRoute, Params, Router } from '@angular/router'

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

  public hasInterestingQueryParams2(keys: string[]): boolean {
    const paramMap = this.route.snapshot.queryParamMap;
    return keys.some((param: string) => {
      return paramMap.has(param) && paramMap.getAll(param).length > 0;
    });
  }

  public getQueryParam2(key: string): string[] {
    const paramMap = this.route.snapshot.queryParamMap;
    return paramMap.getAll(key);
  }

  public getQueryParams2(keys: string[]): Map<string, string[]> {
    const paramMap = this.route.snapshot.queryParamMap;
    return new Map(
      Object.entries(
        keys.reduce((acc: Record<string, string[]>, curr: string) => {
          acc[curr] = paramMap.getAll(curr);
          return acc;
        }, {} as Record<string, string[]>)
      )
    )

  }

  public getAllQueryParams2(): Map<string, string[]> {
    const paramMap = this.route.snapshot.queryParamMap;
    const map = new Map<string, string[]>();

    paramMap.keys.forEach(key => {
      map.set(key, paramMap.getAll(key));
    });

    return map;
  }

  public updateQueryParam2(key: string, value: string[]): void {
    this.router.navigate([], {
      queryParams: { [key]: value },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }

  public updateQueryParams2(params: Map<string, string[]>): void {
    const obj = Object.fromEntries(params);
    this.router.navigate([], {
      queryParams: obj,
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }

  public updateAllQueryParams2(params: Map<string, string[]>): void {
    const obj = Object.fromEntries(params);
    this.router.navigate([], {
      queryParams: obj,
      queryParamsHandling: 'replace',
      replaceUrl: true
    });
  }

  public substituteQueryparams2(key: string, paramsToAdd: string[], paramsToRemove: string[]): void {
    const paramMap = this.route.snapshot.queryParamMap;
    const values: string[] = paramMap.getAll(key);
    const result: string[] = Array.from(new Set([
      ...values.filter((k: string) => !paramsToRemove.includes(k)),
      ...paramsToAdd
    ]));
    this.router.navigate([], {
      queryParams: { [key]: result.length ? result : null },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }

  public removeQueryParam(key: string): void {
    this.router.navigate([], {
      queryParams: { [key]: null },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }

  public getDateFromQueryParams(): Date | undefined {
    const dateStr: string | null = this.route.snapshot.queryParamMap.get('date');
    if (!dateStr) return undefined;
    const date: Date = new Date(dateStr);
    return isNaN(date.getTime()) ? undefined : date;
  }

  public toDatetimelocal(date: Date): string {
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  }
}