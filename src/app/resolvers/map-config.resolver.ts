// Libraries
import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { catchError, map, of } from 'rxjs';

// Models
import { MapConfig } from '../models';

// Services
import { ConfigService } from '../services';

// Resolver
export const mapConfigResolver: ResolveFn<MapConfig> = (route, state) => {
  const configService: ConfigService = inject(ConfigService);

  return configService.getMapConfig()
    .pipe(
      map((config: MapConfig) => {
        return config;
      }),
      catchError((err) => {        
        console.error(err);
        return of({ position: [0, 0] as [number, number], zoom: 0 });
      })
    )
};