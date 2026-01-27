/** Dependencies */
import { Injectable } from '@angular/core'

/** Services */
import { ApiService } from './api.service'

/** Service */
@Injectable({
  providedIn: 'root'
})
export class RadarService {

  constructor(private apiService: ApiService) { }

  public async getRadarImg(url: string, token?: string): Promise<string> {
    return this.apiService.getApiData(url, token)
      .then((data: any) => {
        if (Array.isArray(data) && data.length === 0) throw new Error(`Immagine non trovata per la data selezionata.`);        
        return `data:${data['mimeType']};base64,${data['base64Data']}`;
      })
      .catch((err: unknown) => {
        throw new Error(err instanceof Error ? err.message : `Errore nel recupero delle immagini del radar.`);
      })
  }
}