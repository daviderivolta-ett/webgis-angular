/* Dependencies */
import { inject, Injectable } from '@angular/core'

/* Services */
import { ApiService } from '../../../services'

/* Service */
@Injectable({
  providedIn: 'root',
})
export class TimeserieService {
  /* Dependency injection */
  private apiService = inject(ApiService);
  
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
}