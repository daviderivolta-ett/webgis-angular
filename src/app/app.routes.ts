import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: 'dati',
        title: 'OMIRL ARPAL - Dati',
        loadComponent: () => import('./pages/data/data-page/data-page.component').then(c => c.DataPageComponent)
    },
    {
        path: 'tabelle',
        title: 'OMIRL ARPAL - Tabelle',
        loadComponent: () => import('./pages/tables/tables-page/tables-page.component').then(c => c.TablesPageComponent)
    },
    {
        path: 'radar',
        title: 'OMIRL ARPAL - Satellite e radar',
        loadComponent: () => import('./pages/radars/radars-page/radars-page.component').then(c => c.RadarsPageComponent)
    }
];
