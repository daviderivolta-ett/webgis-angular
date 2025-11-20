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

  /** Get WMS layer legend */
  public async getWMSLayerLegend(layer: WMSLayer): Promise<string> {
    const url: string = `${layer.url}?service=WMS&version=1.1.1&request=GetLegendGraphic&layer=${layer.params['layers']}&format=image/png`;
    return fetch(url)
      .then((res: Response) => res.blob())
      .then((blob: Blob) => {
        return URL.createObjectURL(blob);
      })
      .catch(() => {
        throw new Error(`Errore nel recupero dell'immagine della legenda del layer WMS ${layer.label ?? layer.id}`);
      })
  }
}
