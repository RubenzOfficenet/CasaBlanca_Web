import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule, MatDialogRef, MatDialogContent, MatDialogActions } from "@angular/material/dialog";
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ICasaCreate } from '../interface/icasa.interfase';
import { InmueblesServices } from '../services/inmuebles-services';
import { ConfirmDialog } from "../../shared/confirm-dialog/confirm-dialog";

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
export class Nuevoinmueble {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<Nuevoinmueble>);
  private readonly _inmueblesServices = inject(InmueblesServices);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);

  // 1. Convertimos las peticiones HTTP directamente a Signals (valor inicial [])
  // Esto elimina la necesidad de ngOnInit, subscribe, setTimeout o detectChanges()
  readonly ubicaciones = toSignal(this._inmueblesServices.getUbicaciones(), { initialValue: [] });
  readonly estadosOcupacion = toSignal(this._inmueblesServices.getEstadosOcupacion(), { initialValue: [] });

  // 2. Formulario con valores iniciales limpios (usar null o '' en lugar de '-1')
inmuebleForm: FormGroup = this.fb.group({
  Ubicacion: ['', Validators.required],
  NumeroCasa: ['', [Validators.required, Validators.pattern(/^[^\s]+$/)]],
  CuotaDeMantenimientoBase: [null, [Validators.required, Validators.min(0)]],
  EstadoOcupacion: [null, [Validators.required, Validators.min(0)]], // Inicializado en null
  NumeroHabitantes: [null, [Validators.required, Validators.min(0)]],
  Observaciones: ['']
});

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
    const nuevaCasa = this.construirNuevaCasa();

    debugger;
    this._inmueblesServices.postCreateHouse(nuevaCasa).subscribe({
      next: (respuesta) => {
        this.snackBar.open('Inmueble registrado con éxito', 'OK', { duration: 3000 });
        this.dialogRef.close(respuesta);
      },
      error: () => {
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
      idubicacion: Number(f.Ubicacion) || 0,
      cuotaDeMantenimientoBase: Number(f.CuotaDeMantenimientoBase) || 0,
      IdEstadoOcupacion: Number(f.EstadoOcupacion) || 0,
      numeroHabitantes: Number(f.NumeroHabitantes) || 0,
      observaciones: f.Observaciones || ''
    };
  }
}