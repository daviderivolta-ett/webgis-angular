// Libraries
import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';

// Models
import { GroupedCheckboxItem } from '../models';

// Services
import { ConfigService } from '../services';

// Resolver
export const groupedCheckboxesResolver: ResolveFn<GroupedCheckboxItem[]> = async (route, state) => {
  const configService: ConfigService = inject(ConfigService);

  return configService.getMapLayers()
    .then((config: GroupedCheckboxItem[]) => config)
    .catch((err: any) => {
      console.error(err);
      return []
    });
};
