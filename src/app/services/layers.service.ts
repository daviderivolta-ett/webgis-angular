/** Libraries */
import { Injectable } from '@angular/core';

/** Models */
import { Layer, LayerCategory, WMSLayer } from '../models';

/** Service */
@Injectable({
  providedIn: 'root'
})
export class LayersService {
  /**
  * Methods
  */

  /** Return current layers Map based on layer categories, their maxNumber and incompatibilities */
  public checkLayerCategories(layer: Layer, isChecked: boolean, currentLayers: Map<string, string[]>, layerCategories: Map<string, LayerCategory>, isAuth: boolean): Map<string, string[]> {
    const layerCategoryId: string | undefined = layer.layerCategory;
    if (!layerCategoryId) {
      console.warn('L\'ID della categoria è undefined, operazione saltata.');
      return currentLayers;
    }

    const layerCategory: LayerCategory | undefined = layerCategories.get(layerCategoryId);
    if (!layerCategory) {
      console.warn('Layer category non trovato per l\'ID:', layerCategoryId);
      return currentLayers;
    }

    const updatedCurrentLayers = new Map(currentLayers);
    const existingLayers: string[] = updatedCurrentLayers.get(layerCategoryId) ?? [];

    if (isChecked) {
      this._clearIncompatibleCategories(layerCategory.incompatibleWith, updatedCurrentLayers);
      const updatedLayers = this._addLayerRespectingLimit(layer.id, existingLayers, isAuth ? layerCategory.maxNumber : 1);
      updatedCurrentLayers.set(layerCategoryId, updatedLayers);
    } else {
      const updatedLayers = existingLayers.filter(id => id !== layer.id);
      updatedCurrentLayers.set(layerCategoryId, updatedLayers);
    }

    return updatedCurrentLayers;
  }

  /** Clear incompatible categories in current layers Map */
  private _clearIncompatibleCategories(incompatibleCategoryIds: string[], currentLayers: Map<string, string[]>): void {
    for (const id of incompatibleCategoryIds) {
      if (currentLayers.has(id)) {
        currentLayers.set(id, []);
      }
    }
  }

  /** Check max number in layer categories */
  private _addLayerRespectingLimit(layerId: string, layers: string[], max: number): string[] {
    const newLayers = [layerId, ...layers.filter(id => id !== layerId)];

    if (max !== -1 && newLayers.length > max) {
      return newLayers.slice(0, max);
    }
    return newLayers;
  }

  /** Check layer count by category */
  public getLayerCountByCategory(currentLayers: Map<string, string[]>, categoryId: string): number {
    const category: string[] | undefined = currentLayers.get(categoryId);
    return category ? category.length : -1;
  }

  /** Get WMS layer legend */
  public async getWMSLayerLegend(layer: WMSLayer): Promise<string> {
    const url: string = `${layer.url}?service=WMS&version=1.1.1&request=GetLegendGraphic&layer=${layer.params['layers']}&format=image/png&legend_options=layout:horizontal`;
    return fetch(url)
      .then((res: Response) => res.blob())
      .then((blob: Blob) => {
        return URL.createObjectURL(blob);
      })
      .catch(() => {
        throw new Error(`Errore nel recupero dell'immagine della legenda del layer WMS ${layer.label ?? layer.id}`);
      })
  }

  /** Get WMS feature info */
  // public async getFeatureInfoWMSLayer(layer: WMSLayer, bbox: { ne: [number, number], sw: [number, number] }, point: { x: number, y: number }, size: { width: number, height: number }) {
  public async getFeatureInfoWMSLayer(layer: WMSLayer, bbox: string, point: { x: number, y: number }, size: { width: number, height: number }, latLng: { lat: number, lng: number }) {
    const params: Record<string, any> = {
      service: 'WMS',
      request: 'GetFeatureInfo',
      version: layer.params.version ?? '1.1.1',
      srs: layer.params.srs ?? 'EPSG:4326',
      layers: layer.params.layers,
      query_layers: layer.params.layers,
      styles: layer.params.styles ?? '',
      transparent: true,
      format: 'image/png',
      info_format: 'application/json',
      bbox,
      width: size.width,
      height: size.height,
      x: point.x,
      y: point.y
    };

    let baseUrl = layer.url;
    if (baseUrl.endsWith('ows')) baseUrl = baseUrl.replace('ows', 'wms');
    const url: URL = new URL(baseUrl);
    Object.entries(params).forEach(([key, value]: [string, any]) => url.searchParams.set(key, value));

    return fetch(url)
      .then((res: Response) => {
        if (!res.ok) throw new Error(`Errore nella richiesta delle info del layer WMS.`);
        return res.json()
      })
      .then((data: any) => {
        return this._parseGetFeatureInfo(data, layer.label ?? layer.id);
      })
      .catch((err: unknown) => {
        throw new Error(err instanceof Error ? err.message : `Errore sconosciuto nel recupero dei dati del layer WMS.`);
      })
  }

  private _parseGetFeatureInfo(geoJSON: GeoJSON.FeatureCollection, label: string): [string, number][] {
    return geoJSON.features.map((f: GeoJSON.Feature) => {
      const props = f.properties;

      const propMap =
        props && typeof props === 'object'
          ? new Map(Object.entries(props))
          : new Map();

      const result: [string, number][] = [] as [string, number][];

      if (propMap.size === 1) {
        for (const [_, v] of propMap.entries()) {
          if (v !== -1000) result.push([label, Math.round(v * 100) / 100]);
        }
      }

      return result;
    }).flat();
  }
}
