// Libraries
import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';

// Models
import { LayerGroup, WMSLayer } from '../models';

// Services
import { ConfigService } from '../services';

// Resolver
export const infoLayersResolver: ResolveFn<LayerGroup[]> = async (route, state) => {
  const configService: ConfigService = inject(ConfigService);

  return configService.getInfoLayers()
    .then((data: LayerGroup[]) => data)
    .catch((err: any) => {
      console.error(err);
      return []
    });
};