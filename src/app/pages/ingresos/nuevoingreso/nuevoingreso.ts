import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { InmueblesServices } from '../../inmuebles/services/inmuebles-services';
import { CasaDTO } from './DTO/casaDTO.model';
import { ConceptoIngreso } from './DTO/conceptoIngresos.model';
import { catalogosservice } from '../../../services/catalogos/catalogosservice';
import { ConfirmDialog } from "../../shared/confirm-dialog/confirm-dialog";
import { IIngresoDTO } from './DTO/ingresoDTO.model';
import { IngresosService } from './services/ingresoService';
import { ICatalogocasas } from '../../inmuebles/interface/icatalogocasas.interface';

import { EventosingresoService } from '../../eventos/services/eventosingresoService';
import { Ubicacion } from '../../eventos/Model/ubicacion.interface';
import { EventosService } from '../../../shared/calendar-casa-blanca/services/eventos-service';


@Component({
  selector: 'app-nuevoingreso',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatAutocompleteModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatSnackBarModule
  ],
  templateUrl: './nuevoingreso.html',
  styleUrl: './nuevoingreso.css',
})
export class Nuevoingreso implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly inmueblesServices = inject(InmueblesServices);
  private readonly conceptoIngresosService = inject(catalogosservice);
  private readonly snackBar = inject(MatSnackBar);
  private readonly ingresoService = inject(IngresosService);
  private readonly dialogRef = inject(MatDialogRef<Nuevoingreso>);
  private readonly dialog = inject(MatDialog);
  private readonly catalogosService = inject(EventosingresoService);
  private readonly eventosService = inject(EventosService);

  secciones: any[] = [];
  casas: ICatalogocasas[] = [];
  casaDatos: CasaDTO[] = [];
  casasFiltradas: CasaDTO[] = [];
  conceptoIngreso: ConceptoIngreso[] = [];
  casaControl = new FormControl<string>('', { nonNullable: true });
  ubicacionList: Ubicacion[] = [];

  ingresoForm: FormGroup = this.fb.group({
    seccion: [null, Validators.required],
    casa: [{ value: null, disabled: true }, Validators.required],
    nombre: [{ value: '', disabled: true }],
    fechaRecepcion: ['', Validators.required],
    numeroRecibo: ['', Validators.required],
    concepto: [null, Validators.required],
    fechaConcepto: ['', Validators.required],
    monto: [null, [Validators.required, Validators.min(0.01)]],
    observaciones: ['']
  });

  constructor(private cdRef: ChangeDetectorRef) {
    this.ingresoForm.get('casa')?.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((idCasa) => {
        const casaEncontrada = this.casaDatos.find(c => c.id === idCasa);
        if (casaEncontrada) {
          this.casaControl.setValue(casaEncontrada.casa, { emitEvent: false });
        }
      });
  }

  ngOnInit(): void {
    this.ingresoForm.patchValue({
      fechaRecepcion: this.obtenerFechaActual()
    });

    this.cargarSecciones();
    this.leerConceptoIngreso();
  }

  cargarSecciones(): void {
    this.catalogosService.leeSecciones().subscribe({
      next: (res: any) => {
        this.ubicacionList = Array.isArray(res)
          ? res
          : (res?.data ?? res?.result ?? []);
      },
      error: (err) => {
        console.error('Error al cargar las ubicaciones:', err);
      }
    });
  }

  onSeccionChange(): void {
    const idSeccionSeleccionada = this.ingresoForm.get('seccion')?.value;
    const controlCasa = this.ingresoForm.get('casa');

    controlCasa?.setValue(null, { emitEvent: false });
    this.casasFiltradas = [];
    this.casaDatos = [];

    if (idSeccionSeleccionada) {
      this.leerDatosCasa(Number(idSeccionSeleccionada));
    } else {
      controlCasa?.disable({ emitEvent: false });
    }
  }

  leerDatosCasa(idSeccion: number): void {
    const controlCasa = this.ingresoForm.get('casa');

    this.eventosService.getCasas(idSeccion).subscribe({
      next: (res: any) => {
        const lista = Array.isArray(res) ? res : (res?.data ?? res?.result ?? []);
        this.casas = lista;
        this.casaDatos = lista.map((casa: any) => this.mapToCasaDTO(casa));
        this.casasFiltradas = [...this.casaDatos];

        if (this.casasFiltradas.length > 0) {
          controlCasa?.enable({ emitEvent: false });
        } else {
          controlCasa?.disable({ emitEvent: false });
        }

        this.cdRef.markForCheck();
      },
      error: (error) => {
        console.error('Error al obtener las casas por sección:', error);
        this.casas = [];
        this.casaDatos = [];
        this.casasFiltradas = [];
        controlCasa?.disable({ emitEvent: false });
        this.cdRef.markForCheck();
      }
    });
  }

  filtrarCasas(texto: string): void {
    const busqueda = texto.toLowerCase().trim();
    this.casasFiltradas = this.casaDatos.filter((casa) =>
      casa.casa.toLowerCase().includes(busqueda)
    );
  }

  onCasaChange(): void {
    const idSeleccionado = this.ingresoForm.get('casa')?.value;
    const casaEncontrada = this.casaDatos.find(c => c.id === idSeleccionado);

    if (casaEncontrada) {
      this.seleccionarCasa(casaEncontrada);
    }
  }

  seleccionarCasa(casa: CasaDTO): void {
    this.ingresoForm.get('casa')?.setValue(casa.id);
    this.casaControl.setValue(casa.casa, { emitEvent: false });
    this.cdRef.detectChanges();
  }

  leerConceptoIngreso(): void {
    this.conceptoIngresosService.getConceptoIngresos().subscribe({
      next: (respuesta: ConceptoIngreso[]) => {
        this.conceptoIngreso = respuesta;
        this.cdRef.markForCheck();
      },
      error: (error) => {
        console.error('Error al obtener los conceptos de ingreso:', error);
      }
    });
  }

  mostrarConfirmacion(): void {
    if (this.ingresoForm.invalid) {
      this.ingresoForm.markAllAsTouched();
      this.snackBar.open(
        'Por favor, completa todos los campos requeridos.',
        'Cerrar',
        { duration: 3000, horizontalPosition: 'center', verticalPosition: 'bottom' }
      );
      return;
    }

    const ref = this.dialog.open(ConfirmDialog, {
      data: {
        titulo: 'Registrar Ingreso',
        mensaje: '¿Estás seguro de guardar este nuevo ingreso?'
      }
    });

    ref.afterClosed().subscribe((confirmado) => {
      if (confirmado) {
        this.guardar();
      }
    });
  }

  guardar(): void {
    const datos = this.ingresoForm.getRawValue();
    debugger
    const ingresoDto: IIngresoDTO = {
      idCasa: datos.casa,
      fechaRecepcion: datos.fechaRecepcion,
      numeroRecibo: datos.numeroRecibo,
      idConcepto: datos.concepto,
      fechaConcepto: datos.fechaConcepto,
      monto: Number(datos.monto),
      observaciones: datos.observaciones
    };

    this.ingresoService.agregaIngreso(ingresoDto).subscribe({
      next: (respuesta) => {
        this.snackBar.open('Ingreso registrado con éxito', 'OK', { duration: 3000 });
        this.dialogRef.close(respuesta);
      },
      error: (error) => {
        console.error('Error al crear el ingreso:', error);
        this.snackBar.open(
          'Error al registrar el ingreso. Inténtalo de nuevo.',
          'Cerrar',
          { duration: 3000, horizontalPosition: 'center', verticalPosition: 'bottom' }
        );
      }
    });
  }

  onCancelar(): void {
    this.dialogRef.close(null);
  }

  campoInvalido(campo: string): boolean {
    const control = this.ingresoForm.get(campo);
    return !!(control?.invalid && (control.dirty || control.touched));
  }

  private obtenerFechaActual(): string {
    return new Date().toISOString().split('T')[0];
  }

  private mapToCasaDTO(casa: any): CasaDTO {
    return {
      id: casa.id,
      casa: casa.numeroCasa ?? casa.casa ?? ''
    };
  }
}