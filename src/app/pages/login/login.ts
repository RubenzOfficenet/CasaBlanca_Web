import { booleanAttribute, Component, inject, signal } from '@angular/core';
import { FormBuilder, FormsModule, NgForm, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Loginservices } from './service/loginservices';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LoginRespondeDTO } from './interface/loginResponse.interface';
import { firstValueFrom } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { Changepassword } from './changepassword/changepassword';
import { required } from '@angular/forms/signals';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {

  private readonly loginService = inject(Loginservices);
  private readonly dialog = inject(MatDialog);
  private fb = inject(FormBuilder)
  private readonly snackBar = inject(MatSnackBar);
  private debeCambiarPassword: boolean = true;
  private router = inject(Router);

  private usuarioResult: LoginRespondeDTO = {
    id: 0,
    email: '',
    password: '',
    debeCambiarPassword: false
  };


formularioLogin = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]] // Puedes cambiar la longitud mínima según tus requerimientos
  });

  isFieldInvalid(field: string): boolean {
    const control = this.formularioLogin.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  constructor() { }


  async validarDatos() {
    if (this.formularioLogin.invalid) {
      this.formularioLogin.markAllAsTouched(); // Marca todos los campos para mostrar los errores si intentan enviar sin llenar
      return;
    }
    console.log('Datos formulario: ', this.formularioLogin.value);

    const Pswd = this.formularioLogin.value.password ?? '';
    const Email = this.formularioLogin.value.email ?? '';

    // Pausa la ejecución de la función hasta que el backend responde
    this.usuarioResult = await firstValueFrom(this.loginService.getPassword(Email, Pswd));

    if (!this.usuarioResult || this.usuarioResult.id === 0) {
      console.log('El usuario no existe.');
      this.snackBar.open(
        'El usuario no existe.',
        'Cerrar',
        { duration: 3000, horizontalPosition: 'center', verticalPosition: 'bottom' }
      );
    } else {
      console.log('usuario :', this.usuarioResult);

      // valida si hay que cambiar el password:
      if (this.usuarioResult.debeCambiarPassword == true)
        this.abrirPopup();
      else
        this.router.navigate(['/dashboard']).then(() => {
          window.location.reload();
        });

      // temporal esta linea
      //this.router.navigate(['/dashboard']);

    }
  }



  abrirPopup() {
    const dialogRef = this.dialog.open(Changepassword, {
      width: '30vw',
      maxWidth: '1500px',
      minWidth: '320px',
      disableClose: false,
      hasBackdrop: true,
      height: '450px',
      data: { id: this.usuarioResult.id }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {

        // 1. Abre el SnackBar y guarda la referencia
        const snackBarRef = this.snackBar.open('Contraseña actualizada correctamente', 'Cerrar', {
          duration: 3000, // Duración en milisegundos (3 segundos)
          horizontalPosition: 'center',
          verticalPosition: 'bottom'
        });

        // 2. Escucha el evento cuando se termine el tiempo o se cierre
        snackBarRef.afterDismissed().subscribe(() => {
          // Esta línea se ejecuta exactamente al finalizar el SnackBar
          this.router.navigate(['/login']).then(() => {
            window.location.reload();
          });
        });
      } else {
        console.log('El usuario canceló');
      }
    });
  }


}
