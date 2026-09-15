/* Dependencies */
import { inject } from '@angular/core'
import { ResolveFn } from '@angular/router'

/* Models */
import { MapConfig } from '../models'

/* Services */
import { ConfigService } from '../services'

/* Resolver */
export const mapConfigResolver: ResolveFn<MapConfig> = async () => {
  const configService: ConfigService = inject(ConfigService);

  return configService.getMapConfig()
    .then((config: MapConfig) => config)
    .catch((err: unknown) => {
      console.error(err);
      return new MapConfig()
    });
};