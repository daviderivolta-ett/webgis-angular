// Libraries
import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';

// Models
import { TableConfigGroup } from '../models';

// Services
import { ConfigService } from '../services';

// Resolver
export const tableLabelsResolver: ResolveFn<Map<string, string>> = async (route, state) => {
  const configService: ConfigService = inject(ConfigService);

  return configService.getTableLabels()
    .then((map: Map<string, string>) => map)
    .catch((err: any) => {
      console.error(err);
      return new Map();
    })
};
