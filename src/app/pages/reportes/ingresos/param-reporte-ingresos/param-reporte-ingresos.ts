import { Component, inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { MatDialog, MatDialogActions, MatDialogContent, MatDialogRef } from '@angular/material/dialog';
import { OpcionRangoFecha } from './interfaces/OpcionRangoFecha.interace';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormField, MatLabel, MatOption, MatError, MatSelect } from '@angular/material/select';
import { MatDatepickerToggle, MatDatepicker } from '@angular/material/datepicker';
import { MatDatepickerModule } from '@angular/material/datepicker'; // 1. Directivas de Datepicker
import { MatNativeDateModule } from '@angular/material/core';
import { MONTH_CONSTANTS, YEAR_CONSTATS } from '../../../../Constants/app.constants';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { ConfirmDialog } from '../../../shared/confirm-dialog/confirm-dialog';

import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-param-reporte-ingresos',
  standalone: true,
  imports: [ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatOption,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelect,
    MatDialogActions,
    MatDialogModule,
    ReactiveFormsModule, MatButtonModule, MatDividerModule, MatIconModule, MatError],
  templateUrl: './param-reporte-ingresos.html',
  styleUrl: './param-reporte-ingresos.css',
})
export class ParamReporteIngresos {


  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);
  //private dialogRef = inject(MatDialogRef<ReporteIngresosDialogComponent>);


  private fb = inject(FormBuilder);
  ingresoForm: FormGroup = this.fb.group({
    predefinido: ['personalizado'],
    fechaInicio: [null, [Validators.required]],
    fechaFin: [null, [Validators.required]]
  });


  yearList = Object.entries(YEAR_CONSTATS).map(([key, value]) => ({
    value: Number(key),
    viewValue: value
  }));

  monthList = Object.entries(MONTH_CONSTANTS).map(([key, value]) => ({
    value: Number(key),
    viewValue: value
  }));

  ngOnInit(): void {

    this.ingresoForm = this.fb.group({
      year: ['', Validators.required],
      mesInicio: ['', Validators.required],
      mesFinal: ['', Validators.required]
    }, {
      // Validador personalizado aplicado al FormGroup
      validators: [this.rangoMesesValido]
    });

  }

  private rangoMesesValido(control: AbstractControl): ValidationErrors | null {
    const mesInicio = control.get('mesInicio')?.value;
    const mesFinal = control.get('mesFinal')?.value;

    if (mesInicio !== null && mesFinal !== null && mesFinal < mesInicio) {
      return { rangoInvalido: true };
    }

    return null;
  }

  mostrarConfirmacion(): void {
    if (this.ingresoForm.valid) {
      const datosFormulario = this.ingresoForm.value;
      console.log('Datos del reporte válidos:', datosFormulario);
      this.generarReporte();
    } else {
      this.ingresoForm.markAllAsTouched();
    }
  }



  generarReporte() {
    // Lógica para generar el reporte de ingresos
    console.log('Generando reporte de ingresos...');
  }

}
