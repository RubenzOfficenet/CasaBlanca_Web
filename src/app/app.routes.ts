import { Routes } from '@angular/router';
import { Dashboard } from './pages/dashboard/dashboard';
import { Login } from './pages/login/login';
import { MainLayout } from './pages/main-layout/main-layout';
import { Egresos } from './pages/egresos/egresos';
import { Ingresos } from './pages/ingresos/ingresos';
import { Inmuebles } from './pages/inmuebles/inmuebles';    
import { Usuarios } from './pages/usuarios/usuarios';
import { Eventos } from './pages/eventos/eventos';
import { Eventosingresos } from './pages/eventos/eventosingresos/eventosingresos';


export const routes: Routes = [
    // Ruta sin navbar
    { path: 'login', component: Login },
    { path: '', component: Login },
    // Rutas con navbar
    {
        path: '', component: MainLayout,
        children: [
            { path: 'dashboard', component: Dashboard },
            { path: 'egresos', component: Egresos },
            { path: 'ingresos', component: Ingresos },
            { path: 'inmuebles', component: Inmuebles },
            { path: 'usuarios', component: Usuarios },
            { path: 'eventos', component: Eventos },
            { path: 'eventos/eventosingresos', component: Eventosingresos }
        ]
    },

    {
        path: '**',
        redirectTo: 'login'
    }
];

