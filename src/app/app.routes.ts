// Libraries
import { Routes } from '@angular/router';

// Resolvers
import { baseLayersResolver, infoLayersResolver, groupedCheckboxesResolver, mapConfigResolver, layerCategoriesResolver, colorScalesResolver, tableConfigGroupsResolver, stationsResolver } from './resolvers';

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
            colorScales: colorScalesResolver,
            infoLayers: infoLayersResolver,
            baseLayers: baseLayersResolver,
            layerCategories: layerCategoriesResolver,
            groupedCheckboxes: groupedCheckboxesResolver
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
    // {
    //     path: 'tabelle',
    //     title: 'OMIRL ARPAL - Tabelle',
    //     children: [
    //         {
    //             path: '',
    //             pathMatch: 'full',
    //             redirectTo: 'stazioni'
    //         },
    //         {
    //             path: 'stazioni',
    //             title: 'OMIRL ARPAL - Stazioni',
    //             loadComponent: () => import('./pages/tables/tables-page/tables-page.component').then(c => c.TablesPageComponent),
    //             resolve: {
    //                 apis: apisResolver,
    //                 // tablesConfig: tablesConfigResolver,
    //                 tableConfigGroups: tableConfigGroupsResolver
    //             }
    //         },
    //         {
    //             path: 'massimi-precipitazione',
    //             title: 'OMIRL ARPAL - Massimi precipitazione',
    //             loadComponent: () => import('./pages/tables/tables-page/tables-page.component').then(c => c.TablesPageComponent),
    //             resolve: {
    //                 apis: apisResolver,
    //                 // tablesConfig: tablesConfigResolver
    //             }
    //         },
    //         {
    //             path: 'estremi-temperatura-vento',
    //             title: 'OMIRL ARPAL - Estremi di temperatura e vento',
    //             loadComponent: () => import('./pages/tables/tables-page/tables-page.component').then(c => c.TablesPageComponent),
    //             resolve: {
    //                 apis: apisResolver,
    //                 // tablesConfig: tablesConfigResolver
    //             }
    //         },
    //         {
    //             path: 'livelli-idrometrici',
    //             title: 'OMIRL ARPAL - Livelli idrometrici',
    //             loadComponent: () => import('./pages/tables/tables-page/tables-page.component').then(c => c.TablesPageComponent),
    //             resolve: {
    //                 apis: apisResolver,
    //                 // tablesConfig: tablesConfigResolver
    //             }
    //         }
    //     ]
    // },
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
            }
        ]
    }
];
