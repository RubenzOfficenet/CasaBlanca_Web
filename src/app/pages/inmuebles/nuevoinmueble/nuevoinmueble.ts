import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule, MatDialogRef, MatDialogContent, MatDialogActions } from "@angular/material/dialog";
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { ICasaCreate } from '../interface/icasa.interfase';
import { IEstadosOcupacion } from '../../../interfaces/iestadosocupacion.interfase';
import { InmueblesServices } from '../services/inmuebles-services';
import { ConfirmDialog } from "../../shared/confirm-dialog/confirm-dialog";

export const passwordsIgualesValidator: ValidatorFn = (form: AbstractControl): ValidationErrors | null => {
  const password = form.get('Password')?.value;
  const confirmPassword = form.get('ConfirmPassword')?.value;

  if (!password || !confirmPassword) {
    return null;
  }

  return password === confirmPassword ? null : { passwordsNoCoinciden: true };
};

@Component({
  selector: 'app-nuevoinmueble',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogContent,
    MatDialogActions,
    MatDialogModule,
    MatButtonModule,
    MatSnackBarModule
  ],
  templateUrl: './nuevoinmueble.html',
  styleUrl: './nuevoinmueble.css',
})
export class Nuevoinmueble implements OnInit {
  // Inyección moderna con inject()
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<Nuevoinmueble>);
  private readonly _inmueblesServices = inject(InmueblesServices);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);

  estadosOcupacion: IEstadosOcupacion[] = [];
  numeroCasaVacio: boolean = true;

  inmuebleForm: FormGroup = this.fb.group(
    {
      NumeroCasa: ['', [Validators.required, Validators.pattern(/^.*\S.*$/)]],
      Ubicacion: [''],
      CuotaDeMantenimientoBase: [''],
      EstadoOcupacion: [''],
      NumeroHabitantes: [''],
      NombreTitular: [''],
      ApellidosTitular: [''],
      CelularTitular: [''],
      EmailTitular: [''],
      Usuario: ['', [Validators.required]],
      Password: ['', [Validators.required, Validators.minLength(8)]],
      ConfirmPassword: ['', Validators.required],
      NombreOcupante: [''],
      ApellidosOcupante: [''],
      CelularOcupante: [''],
      EmailOcupante: [''],
      Observaciones: ['']
    },
    {
      validators: passwordsIgualesValidator
    }
  );

  nuevaCasa: ICasaCreate = {
    numeroCasa: '',
    ubicacion: '',
    cuotaDeMantenimientoBase: 0,
    estadoOcupacion: 0,
    nombreTitular: '',
    apellidosTitular: '',
    emailTitular: '',
    celularTitular: '',
    Usuario: '',
    Password: '',
    ConfirmPassword: '',
    nombreOcupante: '',
    apellidosOcupante: '',
    emailOcupante: '',
    celularOcupante: '',
    numeroHabitantes: 0,
    observaciones: ''
  };

  ngOnInit(): void {
    this.getEstadosOcupacion();
  }

  getEstadosOcupacion(): void {
    this._inmueblesServices.getEstadosOcupacion().subscribe({
      next: (data) => {
        this.estadosOcupacion = data;
        if (data.length > 0) {
          this.inmuebleForm.patchValue({
            EstadoOcupacion: data[0].id
          });
        }
      },
      error: (err) => console.error('Error al cargar los Estados de Ocupacion:', err)
    });
  }

  mostrarConfirmacion(): void {
    if (this.inmuebleForm.invalid) {
      this.inmuebleForm.markAllAsTouched();
      this.snackBar.open(
        'Por favor, completa los campos requeridos correctamente.',
        'Cerrar',
        { duration: 3000, horizontalPosition: 'center', verticalPosition: 'bottom' }
      );
      return;
    }

    const ref = this.dialog.open(ConfirmDialog, {
      data: {
        titulo: 'Guardar Inmueble',
        mensaje: '¿Estás seguro de registrar este nuevo inmueble?'
      }
    });

    ref.afterClosed().subscribe((confirmado) => {
      if (confirmado) {
        this.guardar();
      }
    });
  }

  guardar(): void {
    this.nuevaCasa = this.construirNuevaCasa();

    this._inmueblesServices.postCreateHouse(this.nuevaCasa).subscribe({
      next: (respuesta) => {
        this.snackBar.open('Inmueble registrado con éxito', 'OK', { duration: 3000 });
        this.dialogRef.close(respuesta); // Se cierra retornando la respuesta del API
      },
      error: (err) => {
        console.error('Error al guardar el inmueble:', err);
        this.snackBar.open(
          'Error al guardar el inmueble. Inténtalo de nuevo.',
          'Cerrar',
          { duration: 3000, horizontalPosition: 'center', verticalPosition: 'bottom' }
        );
      }
    });
  }

  cancelar(): void {
    this.dialogRef.close(null);
  }

  private construirNuevaCasa(): ICasaCreate {
    const f = this.inmuebleForm.getRawValue();

    return {
      numeroCasa: f.NumeroCasa,
      ubicacion: f.Ubicacion,
      cuotaDeMantenimientoBase: Number(f.CuotaDeMantenimientoBase) || 0,
      estadoOcupacion: f.EstadoOcupacion ? Number(f.EstadoOcupacion) : undefined,
      nombreTitular: f.NombreTitular,
      apellidosTitular: f.ApellidosTitular,
      emailTitular: f.EmailTitular,
      Usuario: f.Usuario,
      Password: f.Password,
      ConfirmPassword: f.ConfirmPassword,
      celularTitular: f.CelularTitular,
      nombreOcupante: f.NombreOcupante,
      apellidosOcupante: f.ApellidosOcupante,
      emailOcupante: f.EmailOcupante,
      celularOcupante: f.CelularOcupante,
      numeroHabitantes: Number(f.NumeroHabitantes) || 0,
      observaciones: f.Observaciones
    };
  }
}