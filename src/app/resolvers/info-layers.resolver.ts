// Libraries
import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { catchError, map, of } from 'rxjs';

// Models
import { WMSLayer } from '../models';

// Services
import { ConfigService } from '../services';

// Resolver
export const infoLayersResolver: ResolveFn<WMSLayer[]> = (route, state) => {
  const configService: ConfigService = inject(ConfigService);

  return configService.getInfoLayers()
    .pipe(
      map((data: WMSLayer[]) => {
        return data;
      }),
      catchError((err) => {
        console.error(err);
        return of([]);
      })
    )
};
