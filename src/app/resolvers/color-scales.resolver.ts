/* Libraries */
import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';

/* Models */
import { ColorScaleBase } from '../models';

/* Services */
import { ConfigService } from '../services';

/* Resolver */
export const colorScalesResolver: ResolveFn<ColorScaleBase[]> = async () => {
    const configService: ConfigService = inject(ConfigService);

    return configService.getColorScales()
        .then((data: ColorScaleBase[]) => data)
        .catch((err: unknown) => {
            console.error(err);
            return [];
        })
}