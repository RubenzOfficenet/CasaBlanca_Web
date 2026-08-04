import { Component, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule ],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {


  constructor(private router: Router) {}
  

  validarDatos(datosUsuario: NgForm) {
    // console.log('Datos del formulario:', datosUsuario.value);
    this.router.navigate(['/dashboard']);
  }



}
