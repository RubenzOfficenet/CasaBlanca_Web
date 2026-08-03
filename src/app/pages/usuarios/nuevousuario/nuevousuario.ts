import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog, MatDialogRef, MatDialogContent, MatDialogActions, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { ConfirmDialog } from '../../shared/confirm-dialog/confirm-dialog';
import { catalogosservice } from '../../../services/catalogos/catalogosservice';
import { IRol } from '../../catalogo/interface/IRol.interfase.';
import { InmueblesServices } from '../../inmuebles/services/inmuebles-services';
import { ICasas } from '../../../Models/inmueble.model';
import { Usuarioservice } from '../services/usuarioservice';
import { IUsuarioNuevo } from './DTO/usuarioto.model';

@Component({
  selector: 'app-nuevousuario',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDialogContent,
    MatDialogActions,
    MatDialogModule // Se reemplaza ConfirmDialog por MatDialogModule
  ],
  templateUrl: './nuevousuario.html',
  styleUrl: './nuevousuario.css',
})
export class Nuevousuario implements OnInit {
  // Inyección moderna de dependencias
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<Nuevousuario>);
  private readonly snackBar = inject(MatSnackBar);
  private readonly usuarioService = inject(Usuarioservice);
  private readonly catalogosService = inject(catalogosservice);
  private readonly inmueblesService = inject(InmueblesServices);
  private readonly dialog = inject(MatDialog);

  roles: IRol[] = [];
  inmuebles: ICasas[] = [];
  
  nuevoUsuario: IUsuarioNuevo = {
    nombreUsuario: '',
    apellidosUsuario: '',
    emailUsuario: '',
    password: '',
    celularUsuario: '',
    idRol: 0,
    idInmueble: 0,
    idEstatus: 1
  };

  usuarioForm = this.fb.group(
    {
      nombreUsuario: ['', Validators.required],
      apellidosUsuario: ['', Validators.required],
      emailUsuario: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      confirmarPassword: ['', Validators.required],
      celularUsuario: [''],
      idRol: [-1, Validators.required],
      idInmueble: [-1, Validators.required]
    },
    {
      validators: this.passwordMatchValidator
    }
  );

  ngOnInit(): void {
    this.leeRoles();
    this.leeInmuebles();
  }

  leeInmuebles(): void {
    this.inmueblesService.getInmuebles().subscribe({
      next: (inmuebles) => {
        this.inmuebles = inmuebles;
        if (this.inmuebles.length > 0) {
          this.usuarioForm.patchValue({
            idInmueble: this.inmuebles[0].id
          });
        }
      },
      error: (err) => console.error(err)
    });
  }

  leeRoles(): void {
    this.catalogosService.getRols().subscribe({
      next: (roles) => {
        this.roles = roles;
        if (this.roles.length > 0) {
          this.usuarioForm.patchValue({
            idRol: this.roles[0].id
          });
        }
      },
      error: (err) => console.error(err)
    });
  }

  mostrarConfirmacion(): void {
    if (this.usuarioForm.invalid) {
      this.usuarioForm.markAllAsTouched();
      this.snackBar.open(
        'Por favor, completa los campos requeridos correctamente.',
        'Cerrar',
        { duration: 3000, horizontalPosition: 'center', verticalPosition: 'bottom' }
      );
      return;
    }

    // Abrimos el modal con la API de MatDialog
    const ref = this.dialog.open(ConfirmDialog, {
      data: {
        titulo: 'Guardar Usuario',
        mensaje: '¿Estás seguro de registrar este nuevo usuario?'
      }
    });

    ref.afterClosed().subscribe((confirmado) => {
      if (confirmado) {
        this.guardar();
      }
    });
  }

  guardar(): void {
    this.nuevoUsuario = this.construirNuevoUsuario();

    this.usuarioService.addUsuario(this.nuevoUsuario).subscribe({
      next: (data) => {
        console.log('Usuario agregado:', data);
        this.snackBar.open('Usuario registrado con éxito', 'OK', { duration: 3000 });
        this.dialogRef.close(data); // Cierra solo cuando el backend responde éxito
      },
      error: (err) => {
        console.error('Error al agregar usuario:', err);
        this.snackBar.open(
          'Error al agregar usuario. Por favor, inténtalo de nuevo.',
          'Cerrar',
          { duration: 3000, horizontalPosition: 'center', verticalPosition: 'bottom' }
        );
      }
    });
  }

  onCancelar(): void {
    this.dialogRef.close(null);
  }

  private construirNuevoUsuario(): IUsuarioNuevo {
    const f = this.usuarioForm.getRawValue();
    return {
      nombreUsuario: f.nombreUsuario ?? '',
      apellidosUsuario: f.apellidosUsuario ?? '',
      emailUsuario: f.emailUsuario ?? '',
      password: f.password ?? '',
      celularUsuario: f.celularUsuario ?? '',
      idRol: f.idRol ?? 0,
      idInmueble: f.idInmueble ?? 0,
      idEstatus: 1
    };
  }

  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmarPassword = control.get('confirmarPassword')?.value;

    if (!password || !confirmarPassword) {
      return null;
    }

    return password === confirmarPassword ? null : { passwordMismatch: true };
  }
}