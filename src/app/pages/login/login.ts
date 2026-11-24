import { booleanAttribute, Component, inject, signal } from '@angular/core';
import { FormBuilder, FormControl, FormsModule, NgForm, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Loginservices } from './service/loginservices';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { LoginRespondeDTO } from './interface/loginResponse.interface';
import { firstValueFrom } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { Changepassword } from './changepassword/changepassword';

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
  private fb = inject(FormBuilder);
  private readonly snackBar = inject(MatSnackBar);
  private debeCambiarPassword: boolean = true;
  private router = inject(Router);

  // --- NUEVO: Estado y control para la ventana emergente de recuperación ---
  mostrarModalRecuperar = signal(false);
  emailRecuperacion = new FormControl('', [Validators.required, Validators.email]);
  // ------------------------------------------------------------------------

  private usuarioResult: LoginRespondeDTO = {
    id: 0,
    email: '',
    password: '',
    debeCambiarPassword: true,
    idUsuario: 0,
    nombre: '',
    apellidos: '',
    rol: '',
  };

  formularioLogin = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  constructor() {}

  // --- NUEVOS MÉTODOS PARA EL MODAL ---
  abrirModalRecuperar(event: Event) {
    event.preventDefault(); // Evita que el <a href="#"> recargue o salte la página
    this.emailRecuperacion.reset();
    this.mostrarModalRecuperar.set(true);
  }

  cerrarModalRecuperar() {
    this.mostrarModalRecuperar.set(false);
  }

  recuperarPassword() {
    if (this.emailRecuperacion.invalid) {
      this.emailRecuperacion.markAsTouched();
      return;
    }

    console.log('generando password ', this.emailRecuperacion.value);
    this.cerrarModalRecuperar();

    this.snackBar.open('Se envio una contraseña temporal para generar una nueva.', 'Cerrar', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
        });

    // Aquí puedes acceder al correo ingresado con: this.emailRecuperacion.value
    
    // Si deseas cerrar la ventana automáticamente después de hacer clic:
    // this.cerrarModalRecuperar();

  }
  // ------------------------------------

  isFieldInvalid(field: string): boolean {
    const control = this.formularioLogin.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  async validarDatos() {
    if (this.formularioLogin.invalid) {
      this.formularioLogin.markAllAsTouched();
      return;
    }

    const Pswd = this.formularioLogin.value.password ?? '';
    const Email = this.formularioLogin.value.email ?? '';

    this.usuarioResult = await firstValueFrom(this.loginService.getPassword(Email, Pswd));

    if (this.usuarioResult.rol != 'Administrador') {
      this.snackBar.open('Solo Administradores tienen acceso', 'Cerrar', {
        duration: 4000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        panelClass: ['snackbar-error'],
      });
      return;
    }

    if (!this.usuarioResult || this.usuarioResult.idUsuario === 0) {
      console.log('El usuario no existe.');
      this.snackBar.open('El usuario no existe.', 'Cerrar', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
      });
    } else {
      console.log('usuario :', this.usuarioResult);

      if (this.usuarioResult.debeCambiarPassword == true) this.abrirPopup();
      else {
        const _nombre: string = this.usuarioResult.nombre + ' ' + this.usuarioResult.apellidos;
        const _rol: string = this.usuarioResult.rol ?? '';
        const _idUsuario = this.usuarioResult.idUsuario;

        window.localStorage.setItem('nombre-usuario', _nombre);
        window.localStorage.setItem('rol-usuario', _rol);
        window.localStorage.setItem('id-usuario', _idUsuario.toString());

        this.router.navigate(['/dashboard']).then(() => {
          window.location.reload();
        });
      }
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
      data: { id: this.usuarioResult.idUsuario },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const snackBarRef = this.snackBar.open('Contraseña actualizada correctamente', 'Cerrar', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
        });

        snackBarRef.afterDismissed().subscribe(() => {
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