// Libraries
import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';

// Models
import { LayerCategory } from '../models';

// Services
import { ConfigService } from '../services';

// Resolver
export const layerCategoriesResolver: ResolveFn<LayerCategory[]> = async (route, state) => {
  const configService: ConfigService = inject(ConfigService);

  return configService.getLayersCategories()
    .then((data: LayerCategory[]) => data)
    .catch((err: any) => {
      console.error(err);
      return []
    });
};
