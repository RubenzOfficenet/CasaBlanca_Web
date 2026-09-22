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
import { Eventosegresos } from './pages/eventos/eventosegresos/eventosegresos';
import { Changepassword } from './pages/login/changepassword/changepassword';
import { adminGuard } from './pages/admin.guard';

export const routes: Routes = [
    { path: 'login', component: Login },
    { path: '', redirectTo: 'login', pathMatch: 'full' },

    {
        path: '',
        component: MainLayout,
        children: [
            {
                path: '',
                redirectTo: () => {
                    // Lectura directa desde localStorage
                    const rol = localStorage.getItem('rolUsuario');
                    return rol === 'Usuario' ? 'ingresos' : 'dashboard';
                },
                pathMatch: 'full'
            },
            { path: 'dashboard', component: Dashboard },
            { path: 'egresos', component: Egresos },
            { path: 'ingresos', component: Ingresos },
            { path: 'inmuebles', component: Inmuebles },
            { path: 'eventos', component: Eventos },
            { path: 'eventos/eventosingresos', component: Eventosingresos },
            { path: 'eventos/eventosegresos', component: Eventosegresos },
            {
                path: 'usuarios',
                component: Usuarios,
                canActivate: [adminGuard]
            },
            { path: 'changepassword', component: Changepassword }
        ]
    },

    { path: '**', redirectTo: 'login' }
];