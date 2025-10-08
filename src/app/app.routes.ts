// Libraries
import { Routes } from '@angular/router';

// Resolvers
import { baseLayersResolver, infoLayersResolver, groupedCheckboxesResolver, mapConfigResolver, layerCategoriesResolver, colorScalesResolver, tableConfigGroupsResolver, stationsResolver, stationPopupConfigResolver, sensorTypesResolver } from './resolvers';

// Routes
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
            stationPopupConfig: stationPopupConfigResolver,
            colorScales: colorScalesResolver,
            infoLayers: infoLayersResolver,
            baseLayers: baseLayersResolver,
            layerCategories: layerCategoriesResolver,
            groupedCheckboxes: groupedCheckboxesResolver,
            stations: stationsResolver,
            sensorTypes: sensorTypesResolver
        }
    },
    {
        path: 'tabelle',
        pathMatch: 'full',
        redirectTo: 'tabelle/TEST'
    },
    {
        path: 'tabelle/:id',
        title: 'OMIRL ARPAL - Tabelle',
        loadComponent: () => import('./pages/tables/tables-page/tables-page.component').then(c => c.TablesPageComponent),
        resolve: {
            tableConfigGroups: tableConfigGroupsResolver
        }
    },
    {
        path: 'radar',
        title: 'OMIRL ARPAL - Satellite e radar',
        loadComponent: () => import('./pages/radars/radars-page/radars-page.component').then(c => c.RadarsPageComponent)
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
                    stations: stationsResolver
                }
            },
            {
                path: 'popup',
                title: 'OMIRL ARPAL - Impostazioni popup',
                loadComponent: () => import('./pages/settings-popup/popup-settings-page/popup-settings-page.component').then(c => c.PopupSettingsPageComponent),
                resolve: {
                    stationPopupConfig: stationPopupConfigResolver
                }
            },
            {
                path: 'periodi',
                title: 'OMIRL ARPAL - Gestione periodi',
                loadComponent: () => import('./pages/settings-period/period-settings-page/period-settings-page.component').then(c => c.PeriodSettingsPageComponent)
            }
        ]
    }
];
