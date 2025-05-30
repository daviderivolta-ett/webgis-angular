// Libraries
import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';

// Models
import { WMSLayer } from '../models';

// Services
import { ConfigService } from '../services';

// Resolver
export const infoLayersResolver: ResolveFn<WMSLayer[]> = async (route, state) => {
  const configService: ConfigService = inject(ConfigService);

  return configService.getInfoLayers()
    .then((data: WMSLayer[]) => data)
    .catch((err: any) => {
      console.error(err);
      return []
    });
};
