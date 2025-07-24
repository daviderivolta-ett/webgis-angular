/** Libraries */
import { Injectable } from '@angular/core';

/** Models */
import { createDefaultStationsPopupConfig, createStationPopupConfigFromObject, StationPopupConfig } from '../models';

/** Service */
@Injectable({
  providedIn: 'root'
})
export class PopupService {

  constructor() { }

  public async savePopupConfig(config: StationPopupConfig): Promise<void> {
    try {
      localStorage.setItem('popup-config', JSON.stringify(config));
    } catch (error: unknown) {
      throw new Error(`Errore nel salvataggio dei dati di configurazione del popup ${error}`);
    }
  }

  public async getPopupConfig(): Promise<StationPopupConfig> {
    try {
      const rawConfig: string | null = localStorage.getItem('popup-config');
      if (!rawConfig) return createDefaultStationsPopupConfig();
      return createStationPopupConfigFromObject(JSON.parse(rawConfig));
    } catch (error: unknown) {
      throw new Error(`Errore nel recupero dei dati di configurazione del popup, ${error}`);
    }
  }
}