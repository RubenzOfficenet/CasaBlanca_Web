import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { DateAdapter, NativeDateAdapter, provideNativeDateAdapter } from '@angular/material/core';
import { Injectable } from '@angular/core';

import { IEgresoDTO } from '../DTO/IEgresoDTO';
import { ConfirmDialog } from "../../shared/confirm-dialog/confirm-dialog";
import { Egresosservice } from '../services/egresosservice';
import { MatSnackBar } from '@angular/material/snack-bar';

export const MY_DATE_FORMATS = {
  parse: {
    dateInput: 'DD-MMM-YYYY',
  },
  display: {
    dateInput: 'dd-MMM-yyyy',
    monthYearLabel: 'MMM yyyy',
    dateA11yLabel: 'dd-MMM-yyyy',
    monthYearA11yLabel: 'MMMM yyyy',
  },
};

@Injectable()
export class CustomDateAdapter extends NativeDateAdapter {
  override format(date: Date, displayFormat: Object): string {
    const day = date.getDate().toString().padStart(2, '0');
    const monthNames = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }
}

@Component({
  selector: 'app-nuevoegreso',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatButtonModule,
    MatDialogModule // Únicamente el módulo para habilitar el servicio MatDialog
  ],
  providers: [
    provideNativeDateAdapter(),
    { provide: DateAdapter, useClass: CustomDateAdapter }
  ],
  templateUrl: './nuevoegreso.html',
  styleUrl: './nuevoegreso.css',
})
export class Nuevoegreso {

  private readonly fb = inject(FormBuilder);
  private readonly dialog = inject(MatDialog);
  private readonly egresoService = inject(Egresosservice);
  private readonly dialogRef = inject(MatDialogRef<Nuevoegreso>);
  private readonly snackBar = inject(MatSnackBar);

  guardando = signal(false);

  egresoForm = this.fb.nonNullable.group({
    Id: [0],
    beneficiario: ['', Validators.required],
    concepto: ['', Validators.required],
    monto: [0, [Validators.required, Validators.min(0.01)]],
    observaciones: [''],
    fechaEgreso: new FormControl<Date>(new Date(), { 
    nonNullable: true, 
    validators: Validators.required 
  })
  });

  constructor() { }


mostrarConfirmacion(): void {
  if (this.egresoForm.invalid) {
    this.egresoForm.markAllAsTouched();
    return;
  }

  const ref = this.dialog.open(ConfirmDialog, {
    data: {
      titulo: 'Guardar Datos',  
      mensaje: '¿Estás seguro de guardar los datos?'
    }
  });

  ref.afterClosed().subscribe(confirmado => {
    if (confirmado) {
      this.guardar();
    }
    // Si presiona "No" en la confirmación, simplemente regresamos al formulario para corregir algo si lo desea.
  });
}

  guardar(): void {
    console.log('Formulario válido en OK:', this.egresoForm.valid);

    if (this.egresoForm.invalid) {
      this.egresoForm.markAllAsTouched();
      return;
    }

    this.guardando.set(true);

    const formValue = this.egresoForm.getRawValue();

    const egresoDto: IEgresoDTO = {
      Id: formValue.Id ?? 0,
      beneficiario: formValue.beneficiario ?? '',
      concepto: formValue.concepto ?? '',
      monto: formValue.monto ?? 0,
      observaciones: formValue.observaciones ?? '',
      fechaEgreso: formValue.fechaEgreso
        ? new Date(formValue.fechaEgreso).toISOString()
        : ''
    };

    console.log('DTO a enviar:', egresoDto);

// --- Consumo del servicio ---
    this.egresoService.agregarEgreso(egresoDto).subscribe({
      next: (respuesta) => {
        

        //this.guardando.set(false);
        console.log('Respuesta del servicio:', respuesta);

        this.snackBar.open('Egreso registrado correctamente', 'Cerrar', {
          duration: 3000,
          horizontalPosition: 'right',
          verticalPosition: 'top'
        });

        // Cerramos la ventana modal pasando true para recargar la tabla principal
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.guardando.set(false);
        console.error('Error al guardar egreso:', err);
        this.snackBar.open('Ocurrió un error al guardar el egreso', 'Cerrar', {
          duration: 4000,
          horizontalPosition: 'right',
          verticalPosition: 'top'
        });
      }
    });
    

  }

  onCancelar(): void {
    console.log('Operación cancelada');
    this.dialogRef.close(false);
  }
}