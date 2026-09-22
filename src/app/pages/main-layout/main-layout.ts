import { Component } from '@angular/core';
import { Navbar } from "../navbar/navbar";
import { RouterOutlet } from "@angular/router";
import { Navbaruser } from '../navbauser/navbaruser/navbaruser';

@Component({
  selector: 'app-main-layout',
  imports: [Navbar, RouterOutlet, Navbaruser],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
})
export class MainLayout {

  rolUsuario : string = '';
constructor(){
  this.rolUsuario = window.localStorage.getItem('rol-usuario') ?? '';
}

}
