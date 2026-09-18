/* Libraries */
import { Routes } from '@angular/router'

/* Resolvers */
import { baseLayersResolver, infoLayersResolver, groupedCheckboxesResolver, mapConfigResolver, layerCategoriesResolver, colorScalesResolver, stationPopupConfigResolver, sensorTypesResolver, apisResolver, settingsConfigResolver, sensorTypes2Resolver } from './resolvers'

/* Routes */
export const routes: Routes = [
    {
        path: '',
        redirectTo: 'dati',
        pathMatch: 'full'
    },
    {
        path: 'dati',
        title: 'OMIRL ARPAL - Dati',
        loadComponent: () => import('./pages/data/data-page/data-page.component').then(c => c.DataPageComponent),
        resolve: {
            mapConfig: mapConfigResolver,
            settings: settingsConfigResolver,
            apisConfig: apisResolver,
            colorScales: colorScalesResolver,
            infoLayers: infoLayersResolver,
            baseLayers: baseLayersResolver,
            layerCategories: layerCategoriesResolver,
            groupedCheckboxes: groupedCheckboxesResolver,
            sensorTypes: sensorTypesResolver,
            sensorTypes2: sensorTypes2Resolver
        }
    },
    {
        path: 'settings',
        title: 'OMIRL ARPAL - Impostazioni',
        children: [
            {
                path: '',
                pathMatch: 'full',
                redirectTo: 'stazioni'
            },
            {
                path: 'stazioni',
                title: 'OMIRL ARPAL - Impostazioni stazioni',
                loadComponent: () => import('./pages/settings-stations/stations-settings-page/stations-settings-page.component').then(c => c.StationsSettingsPageComponent),
                resolve: {
                    apisConfig: apisResolver,
                    sensorTypes: sensorTypesResolver
                }
            },
            {
                path: 'popup',
                title: 'OMIRL ARPAL - Impostazioni popup',
                loadComponent: () => import('./pages/settings-popup/popup-settings-page/popup-settings-page.component').then(c => c.PopupSettingsPageComponent),
                resolve: {
                    apisConfig: apisResolver,
                    stationPopupConfig: stationPopupConfigResolver
                }
            }
        ],
        data: { requiredRole: 'editor' }
    },
    {
        path: 'credits',
        title: 'OMIRL ARPAL - Credits',
        loadComponent: () => import('./pages/credits-page/credits-page.component').then(m => m.CreditsPageComponent)
    }
];
