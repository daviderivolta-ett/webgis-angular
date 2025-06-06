// Libraries
import { Injectable } from '@angular/core';

// Models
import { Command } from '../models';

// Service
@Injectable({
    providedIn: 'root'
})
export class GetWMSCommandService implements Command {
    public async execute(params?: any): Promise<any> {
        try {
            const { id, url, map, options } = params;

            if (!id) {
                throw new Error('Parametro \'id\' mancante. Assicurati di fornire un identificatore univoco per il layer.');
            }
            if (!url) {
                throw new Error('Parametro \'url\' mancante. Non posso eseguire la ricerca del layer WMS senza un URL valido.');
            }
            if (!map) {
                throw new Error('Oggetto \'map\' non è un\'istanza di MapComponent. Assicurati di passare un oggetto valido.');
            }
            if (!options) {
                throw new Error('Oggetto \'options\' mancante. Assicurati di passare un oggetto valido.');
            }

            map.addWMSLayer(id, url, options);

        } catch (error) {
            console.error('Errore nell\'esecuzione del comando:', error);
            throw error;
        }
    }
}