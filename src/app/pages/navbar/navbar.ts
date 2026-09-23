import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink, RouterModule } from "@angular/router";

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar implements OnInit {

  private router = inject(Router);

  nonbreUsuairo: string = ''
  rolUsuario: string = ''

  ngOnInit(): void {
    this.nonbreUsuairo = window.localStorage.getItem('nombre-usuario') ?? 'no-name';
    this.rolUsuario = window.localStorage.getItem('rol-usuario') ?? 'no-rol';
    
    if (this.nonbreUsuairo == 'no-name') {
      this.router.navigate(['/login']).then(() => {
        window.location.reload();
      });
    }

  }

  isSubmenuOpen = signal(false);


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
