/** Dependencies */
import { Injectable } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'

/** Service */
@Injectable({
  providedIn: 'root'
})
export class GlobalStateService {
  /** Constructor */
  constructor(private route: ActivatedRoute, private router: Router) { }

  /** Methods */
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