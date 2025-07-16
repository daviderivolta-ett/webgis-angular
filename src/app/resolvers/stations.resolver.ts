// Libraries
import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';

// Models
import { StationBase } from '../models';

// Services
import { ConfigService } from '../services';

// Resolver
export const stationsResolver: ResolveFn<StationBase[]> = async (route, state) => {
  const configService: ConfigService = inject(ConfigService);

  return configService.getStations()
    .then((groups: StationBase[]) => groups.sort((a, b) => a.id.localeCompare(b.id)))
    .catch((err: any) => {
      console.error(err);
      return [];
    })
};
