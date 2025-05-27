// Libraries
import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { catchError, map, of } from 'rxjs';

// Models
import { TileLayer } from '../models';

// Services
import { ConfigService } from '../services';

// Resolver
export const baseLayersResolver: ResolveFn<TileLayer[]> = (route, state) => {
  const configService: ConfigService = inject(ConfigService);

  return configService.getBaseLayers()
    .pipe(
      map((data: TileLayer[]) => {
        return data;
      }),
      catchError((err) => {
        console.error(err);
        return of([]);
      })
    )
};
