/* Dependencies */
import { inject, Injectable } from '@angular/core'

/* Services */
import { ApiService } from './api.service'

/* Service */
@Injectable({
  providedIn: 'root'
})
export class RadarService {
  private apiService: ApiService = inject(ApiService);

  public async getRadarImg(url: string, token?: string): Promise<string> {
    return this.apiService.getApiData(url, token)
      .then((data: unknown) => {
        if (typeof data !== 'object' || data === null) throw new Error('Invalid object');
        if (!('mimeType' in data) || !('base64Data' in data)) throw new Error('Invalid object');
        return `data:${data['mimeType']};base64,${data['base64Data']}`;
      })
      .catch((err: unknown) => {
        if (err instanceof Error) throw err;
        throw new Error(err instanceof Error ? err.message : `Errore nel recupero delle immagini del radar.`);
      })
  }
}