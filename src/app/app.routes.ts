// Libraries
import { Routes } from '@angular/router';

// Resolvers
import { baseLayersResolver, infoLayersResolver, mapCheckboxResolver, mapConfigResolver } from './resolvers';

// Routes
export const routes: Routes = [
    {
        path: 'dati',
        title: 'OMIRL ARPAL - Dati',
        loadComponent: () => import('./pages/data/data-page/data-page.component').then(c => c.DataPageComponent),
        resolve: {
            mapConfig: mapConfigResolver,
            infoLayers: infoLayersResolver,
            baseLayers: baseLayersResolver,
            mapCheckboxes: mapCheckboxResolver
        }
    },
    {
        path: 'tabelle',
        title: 'OMIRL ARPAL - Tabelle',
        loadComponent: () => import('./pages/tables/tables-page/tables-page.component').then(c => c.TablesPageComponent),
        children: [
            {
                path: '',
                pathMatch: 'full',
                redirectTo: 'stazioni'
            },
            {
                path: 'stazioni',
                title: 'OMIRL ARPAL - Stazioni',
                loadComponent: () => import('./pages/tables/tables-page/tables-page.component').then(c => c.TablesPageComponent)
            },
            {
                path: 'massimi-precipitazione',
                title: 'OMIRL ARPAL - Massimi precipitazione',
                loadComponent: () => import('./pages/tables/tables-page/tables-page.component').then(c => c.TablesPageComponent)
            },
            {
                path: 'estremi-temperatura-vento',
                title: 'OMIRL ARPAL - Estremi di temperatura e vento',
                loadComponent: () => import('./pages/tables/tables-page/tables-page.component').then(c => c.TablesPageComponent)
            },
            {
                path: 'livelli-idrometrici',
                title: 'OMIRL ARPAL - Livelli idrometrici',
                loadComponent: () => import('./pages/tables/tables-page/tables-page.component').then(c => c.TablesPageComponent)
            }
        ]
    },
    {
        path: 'radar',
        title: 'OMIRL ARPAL - Satellite e radar',
        loadComponent: () => import('./pages/radars/radars-page/radars-page.component').then(c => c.RadarsPageComponent)
    }
];
