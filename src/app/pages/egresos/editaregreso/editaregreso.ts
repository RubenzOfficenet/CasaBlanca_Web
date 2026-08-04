import { Component, Injectable, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatDatepickerModule, MatDatepickerToggle, MatDatepicker } from '@angular/material/datepicker';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { DateAdapter, MAT_DATE_FORMATS, NativeDateAdapter } from '@angular/material/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Egresosservice } from '../services/egresosservice';
import { IEgresoAddDTO } from '../DTO/IEgresoAddDTO';
import { ConfirmDialog } from '../../shared/confirm-dialog/confirm-dialog';
import { MatInputModule } from '@angular/material/input'; // <--- OBLIGATORIO para matInput
import { MatButtonModule } from '@angular/material/button'; // <--- Para botones mat-button y mat-flat-button

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
  selector: 'app-editaregreso',
  standalone: true,
  imports: [
    MatDialogModule,
    MatFormField,
    MatLabel,
    MatError,
    MatDatepickerToggle,
    MatDatepicker,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatInputModule,
    MatButtonModule,
    MatButtonModule
  ],
  providers: [
    { provide: DateAdapter, useClass: CustomDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS }
  ],
  templateUrl: './editaregreso.html',
  styleUrl: './editaregreso.css',
})
export class Editaregreso implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly egresoService = inject(Egresosservice);
  private readonly snackBar = inject(MatSnackBar);
  public readonly data = inject<{ id: number }>(MAT_DIALOG_DATA);
  private readonly dialog = inject(MatDialog);

  id = this.data.id;

  egresoForm = this.fb.nonNullable.group({
    beneficiario: ['', Validators.required],
    concepto: ['', Validators.required],
    monto: [0, [Validators.required, Validators.min(0.01)]],
    observaciones: [''],
    fechaEgreso: [new Date(), Validators.required]
  });


  ngOnInit(): void {
    this.egresoService.getEgresosById(this.id).subscribe({
      next: (egreso: IEgresoAddDTO) => {
        this.egresoForm.patchValue({
          beneficiario: egreso.beneficiario,
          concepto: egreso.concepto,
          monto: egreso.monto,
          observaciones: egreso.observaciones ?? '',
          fechaEgreso: new Date(egreso.fechaEgreso)
        });
      },
      error: (err) => {
        this.snackBar.open('Error al cargar el egreso', 'Cerrar', { duration: 3000 });
      }
    });
  }

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
    if (this.egresoForm.invalid) {
      this.egresoForm.markAllAsTouched();
      return;
    }

    const formValue = this.egresoForm.getRawValue();

    const egresoDto: IEgresoAddDTO = {
      fechaEgreso: this.toIsoDate(formValue.fechaEgreso), // 👈 corregido
      beneficiario: formValue.beneficiario,
      concepto: formValue.concepto,
      monto: formValue.monto,
      observaciones: formValue.observaciones
    };

    this.egresoService.actualizarEgreso(this.id, egresoDto).subscribe({
      next: () => {
        this.snackBar.open('Egreso actualizado correctamente', 'Cerrar', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom'
        });
        this.dialog.closeAll();
      },
      error: (err) => {
        console.error('Error al actualizar egreso:', err);
        this.snackBar.open('Error al actualizar el egreso', 'Cerrar', { duration: 3000 });
      }
    });
  }

  private toIsoDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`; // "2026-08-03"
  }




} // end of class