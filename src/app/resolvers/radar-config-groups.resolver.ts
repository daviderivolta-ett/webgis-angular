// Libraries
import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';

// Models
import { RadarConfigGroup } from '../models/radar';

// Services
import { ConfigService } from '../services';

// Resolver
export const radarConfigGroupsResolver: ResolveFn<RadarConfigGroup[]> = async (route, state) => {
  const configService: ConfigService = inject(ConfigService);

  return configService.getRadarConfigGroups()
    .then((groups: RadarConfigGroup[]) => groups)
    .catch((err: any) => {
      console.error(err);
      return [];
    })
};