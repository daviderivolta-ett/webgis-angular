// Libraries
import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';

// Models
import { TableConfigGroup } from '../models';

// Services
import { ConfigService } from '../services';

// Resolver
export const tableConfigGroupsResolver: ResolveFn<TableConfigGroup[]> = async (route, state) => {
  const configService: ConfigService = inject(ConfigService);

  return configService.getTableConfigGroups()
    .then((groups: TableConfigGroup[]) => groups)
    .catch((err: any) => {
      console.error(err);
      return [];
    })
};
