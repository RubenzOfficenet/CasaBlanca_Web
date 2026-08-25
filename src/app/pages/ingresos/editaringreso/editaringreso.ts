import { ChangeDetectorRef, Component, Inject, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';

import { ConfirmDialog } from '../../shared/confirm-dialog/confirm-dialog';
import { CasaDTO } from '../nuevoingreso/DTO/casaDTO.model';
import { ConceptoIngreso } from '../nuevoingreso/DTO/conceptoIngresos.model';
import { ICasas } from '../../../Models/inmueble.model';
import { InmueblesServices } from '../../inmuebles/services/inmuebles-services';
import { catalogosservice } from '../../../services/catalogos/catalogosservice';
import { InmuebleEditarDTO } from '../../../Models/InmuebleEditarDTO.model';
import { IngresosService } from '../nuevoingreso/services/ingresoService';
import { IIngresoUpdate } from '../nuevoingreso/DTO/ingresoUpdateDTO';
import { IIngresoDataUpdate } from '../nuevoingreso/DTO/ingresoDataUpdate';

@Component({
  selector: 'app-editaringreso',
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatInputModule
  ],
  templateUrl: './editaringreso.html',
  styleUrl: './editaringreso.css',
})
export class Editaringreso implements OnInit {
  private fb = inject(FormBuilder);
  private inmueblesServices = inject(InmueblesServices);
  private cdr = inject(ChangeDetectorRef);
  private conceptoIngresosService = inject(catalogosservice);
  private ingresoService = inject(IngresosService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  private dialogRef = inject(MatDialogRef<Editaringreso>);

  ingresoForm!: FormGroup;
  casaDatos: CasaDTO[] = [];
  conceptoIngreso: ConceptoIngreso[] = [];
  casas: ICasas[] = [];
  ingredoData!: IIngresoUpdate;
  IngresoDataUpdate!: IIngresoDataUpdate;

  constructor(@Inject(MAT_DIALOG_DATA) public data: { id: number }) {
    this.ingresoForm = this.fb.group({
      casa: [{ value: null, disabled: true }, Validators.required],
      nombre: [{ value: '', disabled: true }],
      fechaRecepcion: [this.obtenerFechaActual(), Validators.required],
      numeroRecibo: ['', Validators.required],
      concepto: [null, Validators.required],
      fechaConcepto: ['', Validators.required],
      monto: [null, [Validators.required, Validators.min(0.01)]],
      observaciones: ['']
    });
  }

  ngOnInit(): void {
    this.leerDatosCasa();
    this.leerConoceptoIngreso();
    if (this.data?.id) {
      this.leeDatosIngresoById(this.data.id);
    }
  }

  leeDatosIngresoById(id: number): void {
    this.ingresoService.leeIngresoById(id).subscribe({
      next: (respuesta: IIngresoUpdate) => {
        this.ingredoData = respuesta;

        this.ingresoForm.patchValue({
          casa: this.ingredoData.idCasa,
          nombre: this.ingredoData.nombreTitular,
          fechaRecepcion: this.formatToInputDate(this.ingredoData.fechaRecepcion),
          numeroRecibo: this.ingredoData.numeroRecibo,
          concepto: Number(this.ingredoData.idConcepto),
          fechaConcepto: this.formatToInputDate(this.ingredoData.fechaConcepto),
          monto: Number(this.ingredoData.monto),
          observaciones: this.ingredoData.observaciones
        });
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error al obtener los datos del ingreso', error);
      }
    });
  }

  private formatToInputDate(fecha: string): string {
    if (!fecha) return '';
    
    // Si viene en formato ISO o con hora ("YYYY-MM-DDT..."), tomamos solo la fecha
    if (fecha.includes('T')) {
      return fecha.split('T')[0];
    }

    // Si viene en formato MM/DD/YYYY
    const [datePart] = fecha.split(' ');
    const parts = datePart.split('/');
    if (parts.length === 3) {
      const [month, day, year] = parts;
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }

    return fecha;
  }

  leerDatosCasa(): void {
    this.inmueblesServices.getInmuebles().subscribe({
      next: (respuesta: ICasas[]) => {
        this.casas = respuesta;
        this.casaDatos = this.casas.map(casa => this.mapToCasaDTO(casa));
        this.cdr.detectChanges();
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error al obtener las casas', error);
      }
    });
  }

  leerConoceptoIngreso(): void {
    this.conceptoIngresosService.getConceptoIngresos().subscribe({
      next: (respuesta: ConceptoIngreso[]) => {
        this.conceptoIngreso = respuesta;
        this.cdr.markForCheck();
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error al obtener los conceptos', error);
      }
    });
  }

  obtenerFechaActual(): string {
    return new Date().toISOString().split('T')[0];
  }

  campoInvalido(campo: string): boolean {
    const control = this.ingresoForm.get(campo);
    return !!(control?.invalid && (control.dirty || control.touched));
  }

  guardar(): void {
    if (this.ingresoForm.invalid) {
      this.ingresoForm.markAllAsTouched();
      return;
    }

    const datos = this.ingresoForm.getRawValue();

    this.IngresoDataUpdate = {
      id: this.data.id,
      idCasa: datos.casa,
      fechaRecepcion: datos.fechaRecepcion,
      numeroRecibo: datos.numeroRecibo,
      idConcepto: datos.concepto,
      fechaConcepto: datos.fechaConcepto,
      monto: datos.monto,
      observaciones: datos.observaciones
    };

    this.ingresoService.updateIngreso(this.IngresoDataUpdate).subscribe({
      next: () => {
        const snackBarRef = this.snackBar.open('Ingreso actualizado correctamente', 'Cerrar', {
          duration: 3000,
        });

        snackBarRef.afterDismissed().subscribe(() => {
          this.dialogRef.close(true);
        });
      },
      error: (error) => {
        this.snackBar.open('Error al actualizar el ingreso', 'Cerrar', {
          duration: 4000,
        });
        console.error('Error al actualizar el ingreso:', error);
      }
    });
  }

  onCancelar(): void {
    this.dialogRef.close(false);
  }

  mostrarConfirmacion(): void {
    const datos = this.ingresoForm.getRawValue();

    // Validar casa manualmente dado que el control está disabled y .invalid devuelve false
    if (!datos.casa) {
      this.snackBar.open('Debe capturar el Número de Casa.', 'Cerrar', { duration: 3000 });
      return;
    }

    if (this.ingresoForm.get('numeroRecibo')?.invalid) {
      this.snackBar.open('Debe capturar el Número de Recibo.', 'Cerrar', { duration: 3000 });
      return;
    }

    if (this.ingresoForm.get('concepto')?.invalid) {
      this.snackBar.open('Debe capturar el Concepto.', 'Cerrar', { duration: 3000 });
      return;
    }

    if (this.ingresoForm.get('fechaConcepto')?.invalid) {
      this.snackBar.open('Debe capturar la fecha del Concepto.', 'Cerrar', { duration: 3000 });
      return;
    }

    if (this.ingresoForm.get('monto')?.invalid) {
      this.snackBar.open('Debe capturar el monto del ingreso.', 'Cerrar', { duration: 3000 });
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDialog, {
      data: {
        titulo: 'Confirmar Actualización',
        mensaje: '¿Deseas guardar los cambios realizados?'
      }
    });

    dialogRef.afterClosed().subscribe((confirmado: boolean) => {
      if (confirmado) {
        this.guardar();
      }
    });
  }

  private mapToCasaDTO(casa: ICasas): CasaDTO {
    return {
      id: casa.id,
      casa: casa.numeroCasa ?? ''
    };
  }

  alSeleccionarCasa(): void {
    const casaId = this.ingresoForm.get('casa')?.value as number | null;
    if (casaId === null) return;
    //this.leeNombreDeHbitante(casaId);
  }

  // leeNombreDeHbitante(Id: number): void {
  //   this.inmueblesServices.getInuebleById(Id).subscribe({
  //     next: (inmueble: InmuebleEditarDTO) => {
  //       this.ingresoForm.patchValue({
  //         nombre: `${inmueble.nombreTitular} ${inmueble.apellidosTitular}`
  //       });
  //     },
  //     error: (error) => {
  //       console.error('No se pudo obtener el inmueble:', error);
  //     }
  //   });
  // }


actualizarIngrso(){}


}