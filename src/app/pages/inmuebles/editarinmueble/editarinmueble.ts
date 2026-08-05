import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { forkJoin } from 'rxjs';

import { IEstadosOcupacion } from '../../../interfaces/iestadosocupacion.interfase';
import { InmueblesServices } from '../services/inmuebles-services';
import { ConfirmDialog } from '../../shared/confirm-dialog/confirm-dialog';
import { iupdateCasa } from '../interface/iupdateCasa';
import { IUbicacion } from '../nuevoinmueble/DOT/IUbicacion.model';

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
  private readonly fb = inject(FormBuilder);
  private readonly _inmueblesServices = inject(InmueblesServices);
  private readonly dialogRef = inject(MatDialogRef<Editarinmueble>);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);
  public readonly data = inject<{ id: number }>(MAT_DIALOG_DATA);

  estadosOcupacion: IEstadosOcupacion[] = [];
  ubicaciones: IUbicacion[] = [];

  inmuebleForm: FormGroup = this.fb.group({
    numeroCasa: ['', [Validators.required]],
    idubicacion: [null],
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
    this.cargarDatosIniciales();
  }

  // Carga catalogos e inmueble secuencialmente usando forkJoin para evitar race conditions
cargarDatosIniciales(): void {
  forkJoin({
    estados: this._inmueblesServices.getEstadosOcupacion(),
    ubicaciones: this._inmueblesServices.getUbicaciones(),
    inmueble: this._inmueblesServices.getInuebleById(this.data.id)
  }).subscribe({
    next: ({ estados, ubicaciones, inmueble }) => {
      this.estadosOcupacion = estados;
      this.ubicaciones = ubicaciones;

      // Corregido: idUbicacion con U mayúscula, tal como viene del JSON
      const idUbicacionString = inmueble.idUbicacion ? String(inmueble.idUbicacion) : null;

      this.inmuebleForm.patchValue({
        numeroCasa: inmueble.numeroCasa,
        idubicacion: idUbicacionString, // el control del form se llama 'idubicacion' (minúsculas), eso está bien
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
      console.error('Error al cargar datos:', err);
      this.snackBar.open('Error al cargar la información del inmueble.', 'Cerrar', { duration: 3000 });
    }
  });
}

  mostrarConfirmacion(): void {
    if (this.inmuebleForm.invalid) {
      this.inmuebleForm.markAllAsTouched();
      this.snackBar.open('Por favor, valida los campos requeridos.', 'Cerrar', { duration: 3000 });
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
    const rawValues = this.inmuebleForm.getRawValue();

    debugger;
    const datosHouse: iupdateCasa = {
      id: this.data.id,
      ...rawValues,
      idubicacion: Number(rawValues.idubicacion) || 0,
      cuotaDeMantenimientoBase: Number(rawValues.cuotaDeMantenimientoBase) || 0,
      numeroHabitantes: Number(rawValues.numeroHabitantes) || 0,
      estadoOcupacion: Number(rawValues.estadoOcupacion) || 0
    };

    this._inmueblesServices.postUpdateHouse(datosHouse).subscribe({
      next: (res) => {
        this.snackBar.open('Inmueble actualizado correctamente', 'OK', { duration: 3000 });
        this.dialogRef.close(res);
      },
      error: (err) => {
        console.error('Error al actualizar el inmueble:', err);
        this.snackBar.open('Error al actualizar el inmueble. Inténtalo de nuevo.', 'Cerrar', { duration: 3000 });
      }
    });
  }

  cancelar(): void {
    this.dialogRef.close(null);
  }



}