import { ChangeDetectorRef, Component, inject, OnInit, viewChild } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ICasas } from '../../../Models/inmueble.model';
import { InmueblesServices } from '../../inmuebles/services/inmuebles-services';
import { CasaDTO } from './DTO/casaDTO.model';

import { FormControl } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { InmuebleEditarDTO } from '../../../Models/InmuebleEditarDTO.model';
import { ConceptoIngreso } from './DTO/conceptoIngresos.model';
import { catalogosservice } from '../../../services/catalogos/catalogosservice';
import { ConfirmDialog } from "../../shared/confirm-dialog/confirm-dialog";
import { MatSnackBar } from '@angular/material/snack-bar';
import { IIngresoDTO } from './DTO/ingresoDTO.model';
import { IngresosService } from './services/ingresoService';

@Component({
  selector: 'app-nuevoingreso',
  imports: [MatDialogModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatInputModule, ConfirmDialog],
  templateUrl: './nuevoingreso.html',
  styleUrl: './nuevoingreso.css',
})
export class Nuevoingreso implements OnInit {

  private fb = inject(FormBuilder);
  private inmueblesServices = inject(InmueblesServices);
  private conceptoIngresosService = inject(catalogosservice)
  private cdr = inject(ChangeDetectorRef);
  private snackBar = inject(MatSnackBar);
  private ingresoService = inject(IngresosService)

  modalConfirmacion = viewChild<ConfirmDialog>('modalConfirmacion');
  casas: ICasas[] = [];
  casaDatos: CasaDTO[] = [];
  ingresoForm!: FormGroup;
  casasFiltradas: CasaDTO[] = [];
  conceptoIngreso: ConceptoIngreso[] = [];
  ingresoDto: IIngresoDTO = {
    idCasa: '',
    fechaRecepcion: '',
    numeroRecibo: '',
    idConcepto: 0,
    fechaConcepto: '',
    monto: 0,
    observaciones: ''
  };
  casaControl = new FormControl<string>('');

  ngOnInit(): void {
    this.leerConoceptoIngreso();
    this.leerDatosCasa();

    this.casaDatos = this.casas.map(casa => this.mapToCasaDTO(casa));
    this.casasFiltradas = [...this.casaDatos];
    this.cdr.detectChanges();
  }

  constructor() {
    this.ingresoForm = this.fb.group({
      casa: [null, Validators.required],
      nombre: [{ value: '', disabled: true }],
      fechaRecepcion: [this.obtenerFechaActual(), Validators.required],
      numeroRecibo: ['', Validators.required],
      concepto: [null, Validators.required],
      fechaConcepto: ['', Validators.required], // Nuevo campo
      monto: [null, [Validators.required, Validators.min(0.01)]],
      observaciones: ['']
    });




    this.casaControl.valueChanges.subscribe(texto => {
      this.filtrarCasas(texto ?? '');
    });
  }

  filtrarCasas(texto: string): void {
    const busqueda = texto.toLowerCase().trim();

    this.casasFiltradas = this.casaDatos.filter(casa =>
      casa.casa.toLowerCase().includes(busqueda)
    );
  }

  seleccionarCasa(casa: CasaDTO): void {
    this.ingresoForm.get('casa')?.setValue(casa.id);
    this.casaControl.setValue(casa.casa, { emitEvent: false });
  }

  leerConoceptoIngreso() {
    this.conceptoIngresosService.getConceptoIngresos().subscribe({
      next: (respuesta: ConceptoIngreso[]) => {
        this.conceptoIngreso = respuesta;
        console.log(this.conceptoIngreso);
        this.cdr.markForCheck()
      },
      error: (error) => {
        console.error('Error al obtener las casas', error);
      }
    });
  }

  guardar(): void {
    if (this.ingresoForm.invalid) {
      this.ingresoForm.markAllAsTouched();
      return;
    }

    const datos = this.ingresoForm.getRawValue();

    this.ingresoDto = {
      idCasa: datos.casa,
      fechaRecepcion: datos.fechaRecepcion,
      numeroRecibo: datos.numeroRecibo,
      idConcepto: datos.concepto,
      fechaConcepto: datos.fechaConcepto,
      monto: datos.monto,
      observaciones: datos.observaciones
    };
    
    this.ingresoService.agregaIngreso(this.ingresoDto).subscribe({
      next: (respuesta) => {
        console.log('Ingreso creado correctamente:', respuesta);

        // Opcional: limpiar formulario
        this.ingresoForm.reset({
          casa: null,
          concepto: null,
          fechaRecepcion: this.obtenerFechaActual()
        });
      },
      error: (error) => {
        console.error('Error al crear el ingreso:', error);
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

  leerDatosCasa(): void {
    this.inmueblesServices.getInmuebles().subscribe({
      next: (respuesta: ICasas[]) => {
        this.casas = respuesta;
        this.casaDatos = this.casas.map(casa => this.mapToCasaDTO(casa));
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al obtener las casas', error);
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

  onCancelar(): void {
    console.log('Operación cancelada');
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




}
