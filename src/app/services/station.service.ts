// Libraries
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, throwError } from 'rxjs';

// Models
import { StationRecord } from '../models';

// Service
@Injectable({
  providedIn: 'root'
})
export class StationService {

  constructor(private http: HttpClient) { }

  // Methods
  public getStations(url: string) {
    return this.http.get<any[]>(url)
      .pipe(
        map((data: any[]) => data.map((stationData: any) => {
          return this._parseStationData(stationData);
        })),
        catchError((err: any) => {
          return throwError(() => new Error(err.message));
        })
      )
  }

  private _parseStationData(data: any): StationRecord {
    const station = new StationRecord(
      data['shortCode'] && typeof data['shortCode'] === 'string' ? data['shortCode'] : '',
      data['name'] && typeof data['name'] === 'string' ? data['name'] : '',
      data['municipality'] && typeof data['municipality'] === 'string' ? data['municipality'] : '',
      data['lat'] && typeof data['lat'] === 'number' ? data['lat'] : 0,
      data['lon'] && typeof data['lon'] === 'number' ? data['lon'] : 0,
      data['updateTime'] && typeof data['lng'] === 'string' ? new Date(data['updateDateTime']) : new Date(),
      data['value'] && typeof data['value'] === 'number' ? data['value'] : 0,
      data['alt'] && typeof data['alt'] === 'number' ? data['alt'] : 0,
    );
    return station;
  }
}
