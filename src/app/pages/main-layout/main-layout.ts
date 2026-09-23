import { Component, inject } from '@angular/core';
import { Navbar } from "../navbar/navbar";
import { Router, RouterOutlet } from "@angular/router";
import { Navbaruser } from '../navbauser/navbaruser/navbaruser';

@Component({
  selector: 'app-main-layout',
  imports: [Navbar, RouterOutlet, Navbaruser],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
})
export class MainLayout {

  private router = inject(Router);
  
  rolUsuario: string = '';
  nombreUsuairo: string = '';
  constructor() {
    this.rolUsuario = window.localStorage.getItem('rol-usuario') ?? '';
    this.nombreUsuairo = window.localStorage.getItem('nombre-usuario') ?? '';

    if (this.nombreUsuairo == 'no-name' || this.nombreUsuairo == '') {
      this.router.navigate(['/login']).then(() => {
        window.location.reload();
      });
    }
  }

}
