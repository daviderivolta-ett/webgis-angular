// Libraries
import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';

// Models
import { TablesConfig } from '../models';

// Services
import { ConfigService } from '../services';

// Resolver
export const tablesConfigResolver: ResolveFn<any> = async (route, state) => {
  const configService: ConfigService = inject(ConfigService);

  return configService.getTablesConfig()
    .then((data: any) => data)
    .catch((err: any) => {
      console.error(err);
      return new TablesConfig();
    });
};
