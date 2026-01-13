// Libraries
import { Routes } from '@angular/router';

// Resolvers
import { baseLayersResolver, infoLayersResolver, groupedCheckboxesResolver, mapConfigResolver, layerCategoriesResolver, colorScalesResolver, tableConfigGroupsResolver, stationsResolver, stationPopupConfigResolver, sensorTypesResolver, apisResolver, settingsConfigResolver, tableLabelsResolver, radarConfigGroupsResolver } from './resolvers';

/** Guards */
import { authGuard } from './guards';

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
            settings: settingsConfigResolver,
            apisConfig: apisResolver,
            stationPopupConfig: stationPopupConfigResolver,
            colorScales: colorScalesResolver,
            infoLayers: infoLayersResolver,
            baseLayers: baseLayersResolver,
            layerCategories: layerCategoriesResolver,
            groupedCheckboxes: groupedCheckboxesResolver,
            sensorTypes: sensorTypesResolver
        }
    },
    {
        path: 'tabelle',
        pathMatch: 'full',
        redirectTo: 'tabelle/stazioni'
    },
    {
        path: 'tabelle/stazioni',
        title: 'OMIRL ARPAL - Tabelle',
        loadComponent: () => import('./pages/tables-stations/tables-stations-page/tables-stations-page.component').then(c => c.TablesStationsPageComponent),
        resolve: {
            apisConfig: apisResolver,
            tableConfigGroups: tableConfigGroupsResolver,
            tableLabels: tableLabelsResolver,
            sensorTypes: sensorTypesResolver
        }
    },
    {
        path: 'tabelle/massimi-precipitazione',
        title: 'OMIRL ARPAL - Tabelle',
        loadComponent: () => import('./pages/tables-max/tables-max-page/tables-max-page.component').then(c => c.TablesMaxPageComponent),
        resolve: {
            apisConfig: apisResolver,
            tableConfigGroups: tableConfigGroupsResolver,
            tableLabels: tableLabelsResolver,
            sensorTypes: sensorTypesResolver
        }
    },
    {
        path: 'tabelle/estremi-temperatura-vento',
        title: 'OMIRL ARPAL - Tabelle',
        loadComponent: () => import('./pages/tables-extremes/tables-extremes-page/tables-extremes-page.component').then(c => c.TablesExtremesPageComponent),
        resolve: {
            apisConfig: apisResolver,
            tableConfigGroups: tableConfigGroupsResolver,
            tableLabels: tableLabelsResolver,
            sensorTypes: sensorTypesResolver
        }
    },
    {
        path: 'tabelle/livelli-idrometrici',
        title: 'OMIRL ARPAL - Tabelle',
        loadComponent: () => import('./pages/tables-levels/tables-levels-page/tables-levels-page.component').then(c => c.TablesLevelsPageComponent),
        resolve: {
            apisConfig: apisResolver,
            tableConfigGroups: tableConfigGroupsResolver,
            tableLabels: tableLabelsResolver,
            sensorTypes: sensorTypesResolver
        }
    },
    {
        path: 'tabelle/modelli-idrologici',
        title: 'OMIRL ARPAL - Tabelle',
        canMatch: [authGuard],
        loadComponent: () => import('./pages/tables-hydro/tables-hydro-page/tables-hydro-page.component').then(c => c.TablesHydroPageComponent),
        resolve: {
            apisConfig: apisResolver,
            tableConfigGroups: tableConfigGroupsResolver,
            tableLabels: tableLabelsResolver,
            sensorTypes: sensorTypesResolver
        }
    },
    {
        path: 'tabelle/:id',
        title: 'OMIRL ARPAL - Tabelle',
        loadComponent: () => import('./pages/tables/tables-page/tables-page.component').then(c => c.TablesPageComponent),
        resolve: {
            apisConfig: apisResolver,
            tableConfigGroups: tableConfigGroupsResolver,
            tableLabels: tableLabelsResolver,
            sensorTypes: sensorTypesResolver
        }
    },
    {
        path: 'satellite',
        pathMatch: 'full',
        redirectTo: 'satellite/satellite_nord_visible'
    },
    {
        path: 'satellite/:id',
        title: 'OMIRL ARPAL - Satellite',
        loadComponent: () => import('./pages/radars/radars-page/radars-page.component').then(c => c.RadarsPageComponent),
        resolve: {
            apisConfig: apisResolver,
            radarConfigGroups: radarConfigGroupsResolver
        },
        data: { type: 'satellite' }
    },
    {
        path: 'radar',
        pathMatch: 'full',
        redirectTo: 'radar/radar_rain_1h'
    },
    {
        path: 'radar/:id',
        title: 'OMIRL ARPAL - Radar',
        loadComponent: () => import('./pages/radars/radars-page/radars-page.component').then(c => c.RadarsPageComponent),
        resolve: {
            apisConfig: apisResolver,
            radarConfigGroups: radarConfigGroupsResolver
        },
        data: { type: 'radar' }
    },
    {
        path: 'settings',
        title: 'OMIRL ARPAL - Impostazioni',
        canMatch: [authGuard],
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
                    // stations: stationsResolver
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
                loadComponent: () => import('./pages/settings-period/period-settings-page/period-settings-page.component').then(c => c.PeriodSettingsPageComponent),
                resolve: {
                    apisConfig: apisResolver
                }
            }
        ]
    }
];
