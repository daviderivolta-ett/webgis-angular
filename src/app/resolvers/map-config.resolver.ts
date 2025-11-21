// Libraries
import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';

// Models
import { MapConfig } from '../models';

// Services
import { ConfigService } from '../services';

// Resolver
export const mapConfigResolver: ResolveFn<MapConfig> = async (route, state) => {
  const configService: ConfigService = inject(ConfigService);

  return configService.getMapConfig()
    .then((config: MapConfig) => config)
    .catch((err: any) => {
      console.error(err);
      return { position: [0, 0] as [number, number], zoom: 0, maxBounds: [[0, 0], [0, 0]] as [number, number][] }
    });
};