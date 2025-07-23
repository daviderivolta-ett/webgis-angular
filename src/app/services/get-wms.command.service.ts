// Libraries
import { Injectable } from '@angular/core';

// Models
import { Command, WMSLayer } from '../models';

// Service
@Injectable({
    providedIn: 'root'
})
export class GetWMSCommandService implements Command {
    public async execute(args?: any): Promise<any> {
        try {
            const { map, layer } = args;

            if (!layer || !(layer instanceof WMSLayer)) {
                throw new Error(`Parametro 'layer' mancante od errato. Assicurati di passare al comando un layer di classe 'WMSLayer'.`)
            }

            if (!map || typeof map.addTimeDimensionWMSLayer !== 'function' || typeof map.addWMSLayer !== 'function') {
                throw new Error(`Oggetto 'map' non valido o non implementa i metodi 'addTimeDimensionWMSLayer' o 'addWMSLayer'.`);
            }

            const { id, url, layerCategory, opacity, params } = layer;

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

        } catch (error) {
            console.error('Errore nell\'esecuzione del comando:', error);
            throw error;
        }
    }
}