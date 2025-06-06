// Libraries
import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';

// Models
import { LayerGroup } from '../models';

// Services
import { ConfigService } from '../services';

// Resolver
// export const baseLayersResolver: ResolveFn<TileLayer[]> = async (route, state) => {
//   const configService: ConfigService = inject(ConfigService);

//   return configService.getBaseLayers()
//     .then((data: TileLayer[]) => data)
//     .catch((err: any) => {
//       console.error(err);
//       return []
//     });
// };
export const baseLayersResolver: ResolveFn<LayerGroup[]> = async (route, state) => {
  const configService: ConfigService = inject(ConfigService);

  return configService.getBaseLayers()
    .then((data: LayerGroup[]) => data)
    .catch((err: any) => {
      console.error(err);
      return []
    });
};
