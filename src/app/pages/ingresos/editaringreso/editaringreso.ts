import { ChangeDetectorRef, Component, Inject, inject, OnInit, viewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, FormGroup, Validators } from '@angular/forms';
import { MatDialogContent, MatDialogActions, MatDialogModule } from "@angular/material/dialog";
import { ConfirmDialog } from "../../shared/confirm-dialog/confirm-dialog";
import { CasaDTO } from '../nuevoingreso/DTO/casaDTO.model';
import { ConceptoIngreso } from '../nuevoingreso/DTO/conceptoIngresos.model';
import { MatButtonModule } from '@angular/material/button';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { ICasas } from '../../../Models/inmueble.model';
import { HttpErrorResponse } from '@angular/common/http';
import { InmueblesServices } from '../../inmuebles/services/inmuebles-services';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { catalogosservice } from '../../../services/catalogos/catalogosservice';
import { InmuebleEditarDTO } from '../../../Models/InmuebleEditarDTO.model';
import { IngresosService } from '../nuevoingreso/services/ingresoService';
import { IIngresoUpdate } from '../nuevoingreso/DTO/ingresoUpdateDTO';
import { MatSnackBar } from '@angular/material/snack-bar';
import { IIngresoDataUpdate } from '../nuevoingreso/DTO/ingresoDataUpdate';


@Component({
  selector: 'app-editaringreso',
  imports: [MatDialogModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatInputModule,
    ConfirmDialog],
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
  private dialogRef = inject(MatDialogRef<Editaringreso>);

  ingresoForm!: FormGroup;
  casaDatos: CasaDTO[] = [];
  conceptoIngreso: ConceptoIngreso[] = [];
  casas: ICasas[] = [];
  ingredoData: IIngresoUpdate;
  modalConfirmacion = viewChild<ConfirmDialog>('modalConfirmacion');
  IngresoDataUpdate: IIngresoDataUpdate;

  constructor(@Inject(MAT_DIALOG_DATA) public data: { id: number }) {
    //console.log('Dato input', this.data.id); // aquí ya tienes el id
    this.ingresoForm = this.fb.group({
      casa: [{ value: null, disabled: true }, Validators.required],
      nombre: [{ value: '', disabled: true }],
      fechaRecepcion: [this.obtenerFechaActual(), Validators.required],
      numeroRecibo: ['', Validators.required],
      concepto: [null, Validators.required],
      fechaConcepto: ['', Validators.required], // Nuevo campo
      monto: [null, [Validators.required, Validators.min(0.01)]],
      observaciones: ['']
    });

    this.ingredoData = {
      id: 0,
      idCasa: 0,
      numerocasa: '',
      nombreTitular: '',
      nombreOcupante: '',
      fechaRecepcion: '',
      numeroRecibo: '',
      idConcepto: 0,
      concepto: '',
      fechaConcepto: '',
      monto: 0
    };

    this.IngresoDataUpdate = {
      id: 0,
      idCasa: 0,
      fechaRecepcion: '',
      numeroRecibo: '',
      idConcepto: 0,
      fechaConcepto: '',
      monto: 0,
      observaciones: '',
    }

  }

  ngOnInit(): void {
    this.leerDatosCasa();
    this.leerConoceptoIngreso();
    this.leeDatosIngresoById(this.data.id);
  }


  leeDatosIngresoById(id: number): void {
    this.ingresoService.leeIngresoById(id).subscribe({
      next: (respuesta: IIngresoUpdate) => {
        //console.log('Respuesta cruda:', JSON.stringify(respuesta, null, 2));

        this.ingredoData = respuesta;
        //console.log(this.ingredoData.fechaRecepcion);

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
        console.error('Error al obtener los datso del ingreso', error);
      }
    });
  }

  private formatToInputDate(fecha: string): string {
    if (!fecha) return '';
    const [datePart] = fecha.split(' '); // "07/21/2026"
    const [month, day, year] = datePart.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  private cargarDatosEnFormulario(): void {
    this.ingresoForm.patchValue({
      casa: this.ingredoData.idCasa,
      numerorecibo: this.ingredoData.numeroRecibo,
      // ...resto de campos
    });
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

  leerConoceptoIngreso() {
    this.conceptoIngresosService.getConceptoIngresos().subscribe({
      next: (respuesta: ConceptoIngreso[]) => {
        this.conceptoIngreso = respuesta;
        //console.log(this.conceptoIngreso);
        this.cdr.markForCheck()
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error al obtener las casas', error);
      }
    });
  }

  actualizarIngrso() { }


  obtenerFechaActual(): string {
    return new Date().toISOString().split('T')[0];
  }


  campoInvalido(campo: string): boolean {
    const control = this.ingresoForm.get(campo);
    return !!(control?.invalid && (control.dirty || control.touched));
  }


  guardar() {
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
      next: (respuesta) => {
        //console.log('Actualización realzada correctamente:', respuesta);
        const snackBarRef = this.snackBar.open('Ingreso actualizado correctamente', 'Cerrar', {
          duration: 3000,
        });

        snackBarRef.afterDismissed().subscribe(() => {
          this.onCancelar(); // se ejecuta cuando el snackbar se cierra
        });

      },
      error: (error) => {
        this.snackBar.open('Error al actualizar el ingreso', 'Cerrar', {
          duration: 4000,
        });
        console.error('Error al crear el ingreso:', error);
      }
    });



  }

  onCancelar() {
    this.dialogRef.close(false);
  }

  mostrarConfirmacion(): void {

    if (this.ingresoForm.get('casa')?.invalid) {
      this.snackBar.open(
        'Debe capturar el Número de Casa.',
        'Cerrar',
        {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom'
        }
      );
      return;
    }

    if (this.ingresoForm.get('numeroRecibo')?.invalid) {
      this.snackBar.open(
        'Debe capturar el Número de Recibo.',
        'Cerrar',
        {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom'
        }
      );
      return;
    }

    if (this.ingresoForm.get('concepto')?.invalid) {
      this.snackBar.open(
        'Debe capturar el Concepto.',
        'Cerrar',
        {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom'
        }
      );
      return;
    }


    if (this.ingresoForm.get('fechaConcepto')?.invalid) {
      this.snackBar.open(
        'Debe capturar la fecha del Concepto.',
        'Cerrar',
        {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom'
        }
      );
      return;
    }

    if (this.ingresoForm.get('monto')?.invalid) {
      this.snackBar.open(
        'Debe capturar el monto del ingreso.',
        'Cerrar',
        {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom'
        }
      );
      return;
    }


    this.modalConfirmacion()?.abrir();
  }

  private mapToCasaDTO(casa: ICasas): CasaDTO {
    return {
      id: casa.id,
      casa: casa.numeroCasa ?? ''
    };
  }


  alSeleccionarCasa(): void {
    const casaId = this.ingresoForm.get('casa')?.value as number | null;
    if (casaId === null) {
      return;
    }
    this.leeNombreDeHbitante(casaId);
  }

  leeNombreDeHbitante(Id: number): void {
    this.inmueblesServices.getInuebleById(Id).subscribe({
      next: (inmueble: InmuebleEditarDTO) => {
        this.ingresoForm.patchValue({
          nombre: inmueble.nombreTitular + ' ' + inmueble.apellidosTitular
        });
      },
      error: (error) => {
        console.error('No se pudo obtener el inmueble:', error);
      }
    });
  }



} // fin control
