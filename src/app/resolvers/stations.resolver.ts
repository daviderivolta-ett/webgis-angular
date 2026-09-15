/* Dependencies */
import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';

/* Models */
import { StationBase } from '../models';

/* Services */
import { ConfigService } from '../services';

/* Resolver */
export const stationsResolver: ResolveFn<StationBase[]> = async () => {
  const configService: ConfigService = inject(ConfigService);

  return configService.getStations()
    .then((groups: StationBase[]) => groups.sort((a, b) => a.id.localeCompare(b.id)))
    .catch((err: unknown) => {
      console.error(err);
      return [];
    })
};
