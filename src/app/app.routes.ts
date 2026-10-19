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


export const routes: Routes = [
  // Ruta vacía redirige explícitamente a login
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // Rutas sin navbar
  { 
    path: 'login', 
    loadComponent: () => import('./pages/login/login').then(m => m.Login) 
  },

  // Rutas con navbar (MainLayout)
  {
    path: '',
    loadComponent: () => import('./pages/main-layout/main-layout').then(m => m.MainLayout),
    children: [
      { 
        path: 'dashboard', 
        loadComponent: () => import('./pages/dashboard/dashboard').then(m => m.Dashboard) 
      },
      { 
        path: 'egresos', 
        loadComponent: () => import('./pages/egresos/egresos').then(m => m.Egresos) 
      },
      { 
        path: 'ingresos', 
        loadComponent: () => import('./pages/ingresos/ingresos').then(m => m.Ingresos) 
      },
      { 
        path: 'inmuebles', 
        loadComponent: () => import('./pages/inmuebles/inmuebles').then(m => m.Inmuebles) 
      },
      { 
        path: 'usuarios', 
        loadComponent: () => import('./pages/usuarios/usuarios').then(m => m.Usuarios) 
      },
      { 
        path: 'eventos', 
        loadComponent: () => import('./pages/eventos/eventos').then(m => m.Eventos) 
      },
      { 
        path: 'eventos/eventosingresos', 
        loadComponent: () => import('./pages/eventos/eventosingresos/eventosingresos').then(m => m.Eventosingresos) 
      },
      { 
        path: 'eventos/eventosegresos', 
        loadComponent: () => import('./pages/eventos/eventosegresos/eventosegresos').then(m => m.Eventosegresos) 
      }
    ]
  },

  // Comodín para redirigir rutas no encontradas
  {
    path: '**',
    redirectTo: 'login'
  }
];

// export const routes: Routes = [
//     // Ruta sin navbar
//     { path: 'login', component: Login },
//     { path: '', component: Login },
//     // Rutas con navbar
//     {
//         path: '', component: MainLayout,
//         children: [
//             { path: 'dashboard', component: Dashboard },
//             { path: 'egresos', component: Egresos },
//             { path: 'ingresos', component: Ingresos },
//             { path: 'inmuebles', component: Inmuebles },
//             { path: 'usuarios', component: Usuarios },
//             { path: 'eventos', component: Eventos },
//             { path: 'eventos/eventosingresos', component: Eventosingresos },
//             { path: 'eventos/eventosegresos', component: Eventosegresos }
//         ]
//     },

//     {
//         path: '**',
//         redirectTo: 'login'
//     }
// ];
