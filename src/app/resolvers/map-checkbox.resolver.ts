// Libraries
import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { catchError, map, of } from 'rxjs';

// Models
import { TreeNode } from '../models';

// Services
import { ConfigService } from '../services';

// Resolver
export const mapCheckboxResolver: ResolveFn<TreeNode[]> = (route, state) => {
  const configService: ConfigService = inject(ConfigService);

  return configService.getMapLayers()
  .pipe(
    map((data: TreeNode[]) => {
      return data;
    }),
    catchError((err) => {
      console.error(err);
      return of([]);
    })
  )
};
