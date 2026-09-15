/* Dependencies */
import { inject } from '@angular/core'
import { ResolveFn } from '@angular/router'

/* Services */
import { ConfigService } from '../services'

/* Resolver */
export const apisResolver: ResolveFn<Map<string, string>> = async () => {
  const configService: ConfigService = inject(ConfigService);

  return configService.getApis()
    .then((data: Map<string, string>) => data)
    .catch((err: unknown) => {
      console.error(err);
      return new Map();
    });
};
