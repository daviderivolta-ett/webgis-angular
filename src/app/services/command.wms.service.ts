/** Dependencies */
import { Injectable } from '@angular/core'

/** Models */
import { Command, WMSLayer } from '../models'
import { ApiService } from './api.service';

/** Service */
@Injectable({
    providedIn: 'root'
})
export class WMSCommandService implements Command {
    constructor(private apiService: ApiService) { }

    public async execute(args?: any): Promise<void> {
        const { map, layer, baseUrl } = args;

        try {
            if (!layer || !(layer instanceof WMSLayer)) throw new Error(`Parametro 'layer' mancante od errato. Assicurati di passare al comando un layer di classe 'WMSLayer'.`)
            if (!map || typeof map.addTimeDimensionWMSLayer !== 'function' || typeof map.addWMSLayer !== 'function') throw new Error(`Oggetto 'map' non valido o non implementa i metodi 'addTimeDimensionWMSLayer' o 'addWMSLayer'.`);

            const { id, url: layerUrl, layerCategory, opacity, params } = layer;

            const url: string = baseUrl ? this.apiService.replaceApiBaseUrl(layerUrl, baseUrl) : layerUrl;

            switch (layerCategory) {
                case 'data_wms--time':                  
                    map.addTimeDimensionWMSLayer(id, url, { opacity, ...params });
                    break;
                case 'data_wms':
                    map.addWMSLayer(id, url, { opacity, ...params });
                    break;
                default:
                    console.warn(`Campo 'layerCategory' non riconosciuto: ${layerCategory}, reindirizzato a caso default WMS`);
                    map.addWMSLayer(id, url, { opacity, ...params })
                    break;
            }
        } catch (error: unknown) {
            console.error('Errore nell\'esecuzione del comando:', error);
            throw error;
        }
    }
}