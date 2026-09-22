import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const adminGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  // Leer el rol almacenado en el navegador
  const rol = localStorage.getItem('rolUsuario'); 

  if (rol === 'Administrador') {
    return true; // Permite el acceso
  }

  // Si no es Administrador o no existe el valor, redirige a ingresos
  return router.createUrlTree(['/ingresos']);
};