import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink, RouterModule } from "@angular/router";

@Component({
  selector: 'app-navbaruser',
  imports: [RouterLink, RouterModule],
  templateUrl: './navbaruser.html',
  styleUrl: './navbaruser.css',
})
export class Navbaruser {

  isSubmenuOpen = signal(false);

  private router = inject(Router);

  nonbreUsuairo: string = ''
  rolUsuario: string = ''

  ngOnInit(): void {
    this.nonbreUsuairo = window.localStorage.getItem('nombre-usuario') ?? 'no-name';
    this.rolUsuario = window.localStorage.getItem('rol-usuario') ?? 'no-rol';

    console.log(this.nonbreUsuairo);

    if (this.nonbreUsuairo == 'no-name' || this.nonbreUsuairo == '') {
      this.router.navigate(['/login']).then(() => {
        window.location.reload();
      });
    }
  }

  toggleSubmenu(event: Event): void {
    event.preventDefault();
    this.isSubmenuOpen.update((open) => !open);
  }

  cerrarSesion() {
    // 1. Limpiar datos almacenados de la sesión
    window.localStorage.removeItem('nombre-usuario');
    window.localStorage.removeItem('rol-usuario');
    window.localStorage.removeItem('id-usuario');
    // O limpiar todo el almacenamiento: window.localStorage.clear();

    // 2. Redirigir a la vista de Login
    //this.router.navigate(['/login']);

    this.router.navigate(['/login']).then(() => {
      window.location.reload();
    });
  }

}
