import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { IEstadosOcupacion } from '../../../interfaces/iestadosocupacion.interfase';
import { InmueblesServices } from '../services/inmuebles-services';
import { ConfirmDialog } from '../../shared/confirm-dialog/confirm-dialog';
import { iupdateCasa } from '../interface/iupdateCasa';

@Component({
  selector: 'app-editarinmueble',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogContent,
    MatDialogActions,
    MatDialogModule,
    MatButtonModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
  ],
  templateUrl: './editarinmueble.html',
  styleUrl: './editarinmueble.css',
})
export class Editarinmueble implements OnInit {
  // Inyección de dependencias con inject()
  private readonly fb = inject(FormBuilder);
  private readonly _inmueblesServices = inject(InmueblesServices);
  private readonly dialogRef = inject(MatDialogRef<Editarinmueble>);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);
  public readonly data = inject<{ id: number }>(MAT_DIALOG_DATA);

  estadosOcupacion: IEstadosOcupacion[] = [];

  inmuebleForm: FormGroup = this.fb.group({
    numeroCasa: ['', [Validators.required]],
    ubicacion: [''],
    cuotaDeMantenimientoBase: [0],
    estadoOcupacion: [-1],
    numeroHabitantes: [0],
    nombreTitular: [''],
    apellidosTitular: [''],
    celularTitular: [''],
    emailTitular: [''],
    nombreOcupante: [''],
    apellidosOcupante: [''],
    celularOcupante: [''],
    emailOcupante: [''],
    observaciones: ['']
  });

  ngOnInit(): void {
    this.getEstadosOcupacion();
    this.cargarInmueble();
  }

  cargarInmueble(): void {
    this._inmueblesServices.getInuebleById(this.data.id).subscribe({
      next: (inmueble) => {
        this.inmuebleForm.patchValue({
          numeroCasa: inmueble.numeroCasa,
          ubicacion: inmueble.ubicacion,
          cuotaDeMantenimientoBase: inmueble.cuotaDeMantenimientoBase,
          estadoOcupacion: inmueble.estadoOcupacion,
          numeroHabitantes: inmueble.numeroHabitantes,
          nombreTitular: inmueble.nombreTitular,
          apellidosTitular: inmueble.apellidosTitular,
          celularTitular: inmueble.celularTitular,
          emailTitular: inmueble.emailTitular,
          nombreOcupante: inmueble.nombreOcupante,
          apellidosOcupante: inmueble.apellidosOcupante,
          celularOcupante: inmueble.celularOcupante,
          emailOcupante: inmueble.emailOcupante,
          observaciones: inmueble.observaciones
        });
      },
      error: (err) => {
        console.error('Error al obtener inmueble', err);
        this.snackBar.open('Error al cargar datos del inmueble', 'Cerrar', { duration: 3000 });
      }
    });
  }

  getEstadosOcupacion(): void {
    this._inmueblesServices.getEstadosOcupacion().subscribe({
      next: (data) => {
        this.estadosOcupacion = data;
      },
      error: (err) => {
        console.error('Error al cargar los Estados de Ocupación:', err);
      }
    });
  }

  mostrarConfirmacion(): void {
    if (this.inmuebleForm.invalid) {
      this.inmuebleForm.markAllAsTouched();
      this.snackBar.open(
        'Por favor, valida los campos requeridos.',
        'Cerrar',
        { duration: 3000 }
      );
      return;
    }

    const ref = this.dialog.open(ConfirmDialog, {
      data: {
        titulo: 'Actualizar Inmueble',
        mensaje: '¿Estás seguro de guardar los cambios para este inmueble?'
      }
    });

    ref.afterClosed().subscribe((confirmado) => {
      if (confirmado) {
        this.guardar();
      }
    });
  }

  guardar(): void {
    const datosHouse: iupdateCasa = {
      id: this.data.id,
      ...this.inmuebleForm.getRawValue(),
      cuotaDeMantenimientoBase: Number(this.inmuebleForm.value.cuotaDeMantenimientoBase) || 0,
      numeroHabitantes: Number(this.inmuebleForm.value.numeroHabitantes) || 0,
      estadoOcupacion: Number(this.inmuebleForm.value.estadoOcupacion) || 0
    };

    this._inmueblesServices.postUpdateHouse(datosHouse).subscribe({
      next: (res) => {
        this.snackBar.open('Inmueble actualizado correctamente', 'OK', { duration: 3000 });
        this.dialogRef.close(res); // Se cierra solo tras la respuesta exitosa
      },
      error: (err) => {
        console.error('Error al actualizar el inmueble:', err);
        this.snackBar.open(
          'Error al actualizar el inmueble. Inténtalo de nuevo.',
          'Cerrar',
          { duration: 3000 }
        );
      }
    });
  }

  cancelar(): void {
    this.dialogRef.close(null);
  }
}