import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors,
  ValidatorFn
} from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Loginservices } from '../service/loginservices';
import { UpdateUserInterface } from '../interface/updateUserPassword.interface';
import { UsuarioUpdatePasswordResponse } from '../interface/UsuarioUpdatePasswordResponse.interface';
import { Router } from '@angular/router';

// Validador personalizado para comprobar que ambas contraseñas coincidan
export const matchPasswordsValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');

  if (!password || !confirmPassword) {
    return null;
  }

  // Si confirmPassword tiene otros errores de validación (como 'required'), no sobreescribir aún
  if (confirmPassword.errors && !confirmPassword.errors['passwordMismatch']) {
    return null;
  }

  // Comprobar coincidencia
  if (password.value !== confirmPassword.value) {
    confirmPassword.setErrors({ passwordMismatch: true });
    return { passwordMismatch: true };
  } else {
    // Si coinciden, quitamos el error específico 'passwordMismatch'
    if (confirmPassword.hasError('passwordMismatch')) {
      confirmPassword.setErrors(null);
    }
    return null;
  }
};


@Component({
  selector: 'app-changepassword',
  imports: [CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule],
  templateUrl: './changepassword.html',
  styleUrl: './changepassword.css',
})
export class Changepassword implements OnInit {

  private fb = inject(FormBuilder);
  public dialogRef = inject(MatDialogRef<Changepassword>);
  public data = inject<{ id: number }>(MAT_DIALOG_DATA);
  private usuarioService = inject(Loginservices);
  

  usuarioUpdatePasswordResponse: UsuarioUpdatePasswordResponse = {
    title: '',
    status: 0,
    detail: ''
  }

  // Propiedades para alternar visibilidad de los campos de contraseña
  hidePassword = true;
  hideConfirmPassword = true;

  // Formulario Reactivo
  changePasswordForm: FormGroup = this.fb.group(
    {
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    },
    { validators: matchPasswordsValidator }
  );

  ngOnInit(): void {
    // Puedes acceder a this.data.id en cualquier momento
    console.log('ID del usuario recibido:', this.data.id);
  }


  // Acción del botón Guardar / Aceptar
  onSave(): void {
    if (this.changePasswordForm.valid) {
      this.actualizarPassword();
      this.dialogRef.close(this.changePasswordForm.value);
    } else {
      this.changePasswordForm.markAllAsTouched();
    }
  }

  actualizarPassword() {
    const _password = this.changePasswordForm.get('password')?.value;
    console.log('Actuallizar password del id: ', this.data.id)
    console.log('password', _password);


    const payload: UpdateUserInterface = {
      id: this.data.id,
      password: _password
    };

    this.usuarioService.updatePassword(payload).subscribe({
      next: (response: UsuarioUpdatePasswordResponse) => {
        this.usuarioUpdatePasswordResponse = {
          title: response.title,
          status: response.status,
          detail: response.detail
        }
        console.log(this.usuarioUpdatePasswordResponse);

        
      },
      error: (err) => {
        console.error('Error:', err);
      }
    });

  }


  // Acción del botón Cancelar / Cerrar
  onCancel(): void {
    this.dialogRef.close(null);
  }

}
