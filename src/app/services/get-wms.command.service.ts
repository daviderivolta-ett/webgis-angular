// Libraries
import { Injectable } from '@angular/core';

// Models
import { Command } from '../models';

// Service
@Injectable({
    providedIn: 'root'
})
export class GetWMSCommandService implements Command {
    public async execute(args?: any): Promise<any> {
        try {
            const { id, url, map, opacity, layerCategory, params } = args;

            if (!id) {
                throw new Error('Parametro \'id\' mancante. Assicurati di fornire un identificatore univoco per il layer.');
            }
            if (!url) {
                throw new Error('Parametro \'url\' mancante. Non posso eseguire la ricerca del layer WMS senza un URL valido.');
            }
            if (!map || typeof map.addTimeDimensionWMSLayer !== 'function' || typeof map.addWMSLayer !== 'function') {
                throw new Error('Oggetto \'map\' non valido o non implementa i metodi \'addTimeDimensionWMSLayer\' o \'addWMSLayer\'.');
            }
            if (!params) {
                throw new Error('Oggetto \'params\' mancante. Assicurati di passare un oggetto valido.');
            }

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