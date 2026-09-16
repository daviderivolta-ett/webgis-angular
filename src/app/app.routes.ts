/* Libraries */
import { Routes } from '@angular/router'

/* Resolvers */
import { baseLayersResolver, infoLayersResolver, groupedCheckboxesResolver, mapConfigResolver, layerCategoriesResolver, colorScalesResolver, stationPopupConfigResolver, sensorTypesResolver, apisResolver, settingsConfigResolver, radarConfigGroupsResolver } from './resolvers'

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
            sensorTypes: sensorTypesResolver
        }
    },
    // {
    //     path: 'satellite',
    //     pathMatch: 'full',
    //     redirectTo: 'satellite/satellite_nord_visible'
    // },
    // {
    //     path: 'satellite/:id',
    //     title: 'OMIRL ARPAL - Satellite',
    //     loadComponent: () => import('./pages/radars/radars-page/radars-page.component').then(c => c.RadarsPageComponent),
    //     resolve: {
    //         apisConfig: apisResolver,
    //         radarConfigGroups: radarConfigGroupsResolver
    //     },
    //     data: { type: 'satellite' }
    // },
    {
        path: 'radar',
        pathMatch: 'full',
        redirectTo: 'radar/radar_liguria_rain_int_5m'
    },
    {
        path: 'radar/:id',
        title: 'OMIRL ARPAL - Radar',
        loadComponent: () => import('./pages/radars/radars-page/radars-page.component').then(c => c.RadarsPageComponent),
        resolve: {
            settings: settingsConfigResolver,
            apisConfig: apisResolver,
            radarConfigGroups: radarConfigGroupsResolver
        },
        data: { type: 'radar' }
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
