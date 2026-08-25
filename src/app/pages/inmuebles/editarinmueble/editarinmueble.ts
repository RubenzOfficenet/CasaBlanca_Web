import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
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

  _idUbicacion : number = 0;


  // Declaramos el FormGroup
  inmuebleForm!: FormGroup;

  ngOnInit(): void {
    // 1. Inicialización síncrona inmediata antes de cualquier llamada asíncrona
    this.initForm();
    // 2. Carga de datos de catálogo e inmueble
    this.cargarDatosIniciales();
  }

  private initForm(): void {
    this.inmuebleForm = this.fb.group({
      Ubicacion: ['', Validators.required],
      NumeroCasa: ['', [Validators.required, Validators.pattern(/^[^\s]+$/)]],
      CuotaDeMantenimientoBase: ['', Validators.required],
      EstadoOcupacion: [-1, [Validators.required, Validators.min(0)]],
      NumeroHabitantes: ['', Validators.required],
      Observaciones: ['']
    });
  }

 cargarDatosIniciales(): void {
  forkJoin({
    estados: this._inmueblesServices.getEstadosOcupacion(),
    ubicaciones: this._inmueblesServices.getUbicaciones(),
    inmueble: this._inmueblesServices.getInuebleById(this.data.id)
  }).subscribe({
    next: ({ estados, ubicaciones, inmueble }) => {
      this.estadosOcupacion = estados;
      this.ubicaciones = ubicaciones;      

      const idUbicacionObtenido = inmueble?.idUbicacion;      
      this._idUbicacion = idUbicacionObtenido;

      this.inmuebleForm.patchValue({
        Ubicacion: idUbicacionObtenido ?? '',
        NumeroCasa: inmueble.numeroCasa ?? '',
        CuotaDeMantenimientoBase: inmueble.cuotaDeMantenimientoBase ?? '',
        EstadoOcupacion: inmueble.idEstadoOcupacion ?? -1,
        NumeroHabitantes: inmueble.numeroHabitantes ?? '',
        Observaciones: inmueble.observaciones ?? ''
      });
    },
    error: (err) => {
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
    const f = this.inmuebleForm.getRawValue();

    const datosHouse: iupdateCasa = {
      id: this.data.id,
      numeroCasa: f.NumeroCasa,
      idubicacion: Number(f.Ubicacion) || 0,
      cuotaDeMantenimientoBase: Number(f.CuotaDeMantenimientoBase) || 0,
      idEstadoOcupacion: Number(f.EstadoOcupacion) || 0,
      numeroHabitantes: Number(f.NumeroHabitantes) || 0,
      observaciones: f.Observaciones || ''
    };

    console.log('datosHouse : ', datosHouse);
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