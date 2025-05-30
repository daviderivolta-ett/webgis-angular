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
        const { url, options } = params;

        if (!url) console.warn('Parametro \'url\' non presente in \'params\'. Impossibile eseguire la ricerca del wms.');

        console.log(url, options);        
    }
}