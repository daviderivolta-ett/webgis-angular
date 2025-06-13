// Libraries
import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';

// Models
import { LayerGroup } from '../models';

// Services
import { ConfigService } from '../services';

// Resolver
export const groupedCheckboxesResolver: ResolveFn<LayerGroup[]> = async (route, state) => {
  const configService: ConfigService = inject(ConfigService);

  return configService.getDataLayers()
    .then((config: LayerGroup[]) => config)
    .catch((err: any) => {
      console.error(err);
      return []
    });
};