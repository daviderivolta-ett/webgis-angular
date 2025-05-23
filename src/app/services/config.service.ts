// Libraries
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

// Models
import { ConfigData } from '../models/config.model';

// Service
@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  constructor(private http: HttpClient) { }

  // Methods
  // Get config file
  public getConfig(path: string) {
    return this.http.get(`${path}`);
  }

  // Parse config data
  public parseConfigData(data: any): ConfigData {
    return {
      id: data.id ?? '',
      label: data.label ?? ''
    }
  }
}