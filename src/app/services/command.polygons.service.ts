/** Dependencies */
import { Injectable } from '@angular/core'

/** Models */
import { Command, GeoJsonLayer } from '../models'

/** Services */
import { ApiService } from './api.service'

/** Service */
@Injectable({
    providedIn: 'root'
})
export class PolygonsCommandService implements Command {
    constructor(private apiService: ApiService) { }

    public async execute(args?: any): Promise<void> {
        const { map, date, layer, baseUrl, token } = args;

        try {
            if (!layer || !(layer instanceof GeoJsonLayer)) throw new Error(`Parametro 'layer' mancante od errato. Assicurati di passare al comando un layer di classe 'GeoJSONLayer'.`)
            if (!map || typeof map.addGeoJSONLayer !== 'function' || typeof map.addGeoJSONLayer !== 'function') throw new Error(`Oggetto 'map' non valido o non implementa i metodi 'addGeoJSONLayer'.`);

            const { url: layerUrl } = layer;
            const url = baseUrl ? this.apiService.replaceApiBaseUrl(layerUrl, baseUrl) : layerUrl;
            const urlWithDates: string = date ? this._createUrlWithDate(url, date) : this._createUrlWithDate(url, new Date());
            const geoJSON: GeoJSON.FeatureCollection = await this.apiService.getPolygonApiData(urlWithDates, token);
            map.addGeoJSONLayer(layer.id, geoJSON);
        } catch (error) {                              
            if (error instanceof Error) throw new Error(`Layer ${layer.id} non disponibile per la data selezionata.`);
            else throw new Error(`Errore nell'esecuzione del comando.`);
        }

    }

    private _createUrlWithDate(url: string, date: Date): string {
        const separator = url.includes('?') ? '&' : '?';
        return `${url}${separator}time=${date.toISOString()}`;
    }
}